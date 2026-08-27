const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://gulrhstrgfjosxhinehv.supabase.co', 'sb_publishable_ENgqsdhZ-mOyvr9IJUmNTw_b0GckK5C');

async function verifyNewOrder() {
  await supabase.auth.signInWithPassword({ email: 'coffeedrama818@gmail.com', password: '#8495093177a' });

  console.log('=== 1. NEW PRODUCTION ORDER ===');
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*, brands(*)))')
    .ilike('customer_name', '%Aarav%')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return;
  }

  console.log('Orders found:', orders.length);
  const ord = orders[0];
  console.log('Order ID:', ord.id);
  console.log('Order Number:', ord.order_number);
  console.log('Customer:', ord.customer_name);
  console.log('Phone:', ord.customer_phone);
  console.log('Subtotal: ₹' + ord.subtotal);
  console.log('Discount: ₹' + ord.discount_amount);
  console.log('Total Amount: ₹' + ord.total_amount);
  console.log('Payment Method:', ord.payment_method);
  console.log('Payment Status:', ord.payment_status);
  console.log('Created At:', ord.created_at);

  console.log('\n=== 2. LINE ITEMS & BRAND RELATIONSHIPS ===');
  ord.order_items.forEach((oi, i) => {
    console.log(`Item ${i + 1}:`);
    console.log('  order_item.id:', oi.id);
    console.log('  product_id:', oi.product_id);
    console.log('  product.name:', oi.products ? oi.products.name : 'NULL');
    console.log('  product.brand_id:', oi.products ? oi.products.brand_id : 'NULL');
    console.log('  brand.id:', oi.products && oi.products.brands ? oi.products.brands.id : 'NULL');
    console.log('  brand.name:', oi.products && oi.products.brands ? oi.products.brands.name : 'NULL');
    console.log('  quantity:', oi.quantity);
    console.log('  unit_price: ₹' + oi.unit_price);
    console.log('  subtotal: ₹' + oi.subtotal);
  });

  console.log('\n=== 3. COUPON REDEMPTION RECORD ===');
  const { data: rdms } = await supabase
    .from('coupon_redemptions')
    .select('*, coupons(*, brands(*))')
    .eq('order_id', ord.id);
  console.log(JSON.stringify(rdms, null, 2));
}

verifyNewOrder();
