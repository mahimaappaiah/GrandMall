const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient('https://gulrhstrgfjosxhinehv.supabase.co', 'sb_publishable_ENgqsdhZ-mOyvr9IJUmNTw_b0GckK5C');

async function syncAllProducts() {
  await supabase.auth.signInWithPassword({ email: 'coffeedrama818@gmail.com', password: '#8495093177a' });

  const { data: dbBrands } = await supabase.from('brands').select('id, name');
  const brandMap = new Map();
  dbBrands.forEach(b => brandMap.set(b.name.toLowerCase().trim(), b.id));

  const content = fs.readFileSync('index.js', 'utf8');

  // Extract the brands array text
  const startIdx = content.indexOf('let brands = [');
  const endIdx = content.indexOf('let orders = [');
  const brandsJsonStr = content.slice(startIdx + 13, endIdx).trim().replace(/;$/, '');

  let rawBrands;
  try {
    rawBrands = eval(brandsJsonStr);
  } catch (e) {
    console.error('Failed to eval brands:', e);
    return;
  }

  const { data: existingProds } = await supabase.from('products').select('id, name, brand_id');
  const existingNames = new Set(existingProds.map(p => p.name.toLowerCase().trim()));

  const newProducts = [];
  let counter = 100;

  rawBrands.forEach(b => {
    const brandId = brandMap.get(b.name.toLowerCase().trim());
    if (!brandId) return;

    if (Array.isArray(b.items)) {
      b.items.forEach((item, idx) => {
        if (!existingNames.has(item.name.toLowerCase().trim())) {
          counter++;
          newProducts.push({
            brand_id: brandId,
            name: item.name.trim(),
            price: Number(item.price),
            category: item.category || 'Store Item',
            image_url: item.image || null,
            sku: `PROD-${b.id.toUpperCase()}-${idx + 1}-${counter}-${Date.now().toString().slice(-4)}`,
            is_available: true,
            stock_quantity: 25
          });
          existingNames.add(item.name.toLowerCase().trim());
        }
      });
    }
  });

  console.log('Total new products to insert:', newProducts.length);
  if (newProducts.length > 0) {
    // Insert in batches of 20
    for (let i = 0; i < newProducts.length; i += 20) {
      const batch = newProducts.slice(i, i + 20);
      const { data: inserted, error } = await supabase.from('products').insert(batch).select();
      if (error) {
        console.error('Batch insert error:', error);
      } else {
        console.log(`Inserted batch ${i / 20 + 1}:`, inserted.length);
      }
    }
  }

  // Verify Italian B.M.T. Sub
  const { data: subCheck } = await supabase.from('products').select('id, name, brand_id, brands(name)').ilike('name', '%Italian B.M.T%');
  console.log('Italian B.M.T. in DB:', JSON.stringify(subCheck, null, 2));

  // Update line item in order #AX-3123
  if (subCheck && subCheck.length > 0) {
    const subwayProdId = subCheck[0].id;
    const { data: updatedItem, error: updErr } = await supabase
      .from('order_items')
      .update({ product_id: subwayProdId })
      .eq('id', '8fe1692d-8664-4b89-b2de-bf74ba8d47de')
      .select();
    console.log('Updated #AX-3123 Subway line item with product_id:', updatedItem, 'Error:', updErr);
  }
}

syncAllProducts();
