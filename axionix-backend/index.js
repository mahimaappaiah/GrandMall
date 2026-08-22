import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 5000;

const supabaseUrl = process.env.SUPABASE_URL || 'https://gulrhstrgfjosxhinehv.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_ENgqsdhZ-mOyvr9IJUmNTw_b0GckK5C';

export const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());

// In-Memory Database Store initialized with all 33 Customer Portal Flagship Stores
let brands = [
  // FOOD & DINING (6 STORES)
  {
    "id": "food-1",
    "name": "Starbucks Reserve",
    "category": "Food",
    "floor": "Ground Floor",
    "zone": "East Wing",
    "visitorsToday": 950,
    "ordersCount": 420,
    "reservationsCount": 15,
    "conversionRate": 65.0,
    "revenueToday": 480000,
    "status": "Open",
    "manager": "Ananya Sharma",
    "phone": "+91 98555 66778",
    "openHours": "08:00 AM - 11:00 PM",
    "rating": 4.8,
    "logo": "☕",
    "items": [
      {"id": "sb-1","name": "Avocado Artisan Toast & Poached Eggs","price": 650,"category": "Brunch","image": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=80"},
      {"id": "sb-2","name": "Artisan Cold Brew & Butter Croissant","price": 520,"category": "Brunch","image": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80"},
      {"id": "sb-3","name": "Iced Caramel Macchiato Reserve","price": 475,"category": "Quick Bites","image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80"},
      {"id": "sb-4","name": "Smoked Salmon Bagel Cream Cheese","price": 720,"category": "Brunch","image": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80"},
      {"id": "sb-5","name": "Reserve Truffle Mushroom Sourdough","price": 850,"category": "Fine Dining","image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80"}
    ]
  },
  {
    "id": "food-2",
    "name": "Häagen-Dazs",
    "category": "Food",
    "floor": "Ground Floor",
    "zone": "Central Atrium",
    "visitorsToday": 820,
    "ordersCount": 340,
    "reservationsCount": 8,
    "conversionRate": 52.0,
    "revenueToday": 198000,
    "status": "Open",
    "manager": "Rahul K.",
    "phone": "+91 98222 11990",
    "openHours": "10:00 AM - 11:00 PM",
    "rating": 4.7,
    "logo": "🍨",
    "items": [
      {"id": "hd-1","name": "Belgian Chocolate Fondue Platter","price": 950,"category": "Quick Bites","image": "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=400&q=80"},
      {"id": "hd-2","name": "Dulce de Leche Caramel Sundae","price": 620,"category": "Quick Bites","image": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80"},
      {"id": "hd-3","name": "Belgian Waffle & Berry Brunch Bowl","price": 680,"category": "Brunch","image": "https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=400&q=80"},
      {"id": "hd-4","name": "Grand Degustation Dessert Tasting Platter","price": 1250,"category": "Fine Dining","image": "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=400&q=80"}
    ]
  },
  {
    "id": "food-3",
    "name": "Din Tai Fung",
    "category": "Food",
    "floor": "2nd Floor",
    "zone": "Dining Hub North",
    "visitorsToday": 680,
    "ordersCount": 290,
    "reservationsCount": 28,
    "conversionRate": 48.0,
    "revenueToday": 1280000,
    "status": "Open",
    "manager": "Chen Wei",
    "phone": "+91 98111 99887",
    "openHours": "11:00 AM - 10:30 PM",
    "rating": 4.9,
    "logo": "🥟",
    "items": [
      {"id": "dt-1","name": "Signature Pork Xiao Long Bao","price": 850,"category": "Fine Dining","image": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=400&q=80"},
      {"id": "dt-2","name": "Spicy Sesame Sichuan Noodles","price": 590,"category": "Fine Dining","image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=400&q=80"},
      {"id": "dt-3","name": "Shrimp & Egg Fried Rice","price": 690,"category": "Brunch","image": "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=400&q=80"},
      {"id": "dt-4","name": "Steamed Vegetable Dumplings","price": 420,"category": "Quick Bites","image": "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=400&q=80"}
    ]
  },
  {
    "id": "food-4",
    "name": "PizzaExpress Gourmet",
    "category": "Food",
    "floor": "2nd Floor",
    "zone": "Food Court South",
    "visitorsToday": 610,
    "ordersCount": 220,
    "reservationsCount": 14,
    "conversionRate": 41.5,
    "revenueToday": 620000,
    "status": "Open",
    "manager": "Marco Rossi",
    "phone": "+91 98333 77112",
    "openHours": "11:00 AM - 11:00 PM",
    "rating": 4.7,
    "logo": "🍕",
    "items": [
      {"id": "pe-1","name": "Calabrese Spicy Artisanal Pizza","price": 890,"category": "Fine Dining","image": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80"},
      {"id": "pe-2","name": "Dough Balls Doppio Garlic Butter","price": 420,"category": "Quick Bites","image": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=80"},
      {"id": "pe-3","name": "Classic Margherita Romana","price": 690,"category": "Fine Dining","image": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=400&q=80"},
      {"id": "pe-4","name": "Italian Breakfast Panini Brunch","price": 540,"category": "Brunch","image": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400&q=80"}
    ]
  },
  {
    "id": "food-5",
    "name": "Coffee Drama Cafe",
    "category": "Food",
    "floor": "2nd Floor",
    "zone": "Dining Hub North",
    "visitorsToday": 540,
    "ordersCount": 195,
    "reservationsCount": 6,
    "conversionRate": 39.0,
    "revenueToday": 390000,
    "status": "Open",
    "manager": "Siddharth M.",
    "phone": "+91 98495 09317",
    "openHours": "09:00 AM - 10:30 PM",
    "rating": 4.8,
    "logo": "☕",
    "items": [
      {"id": "cd-1","name": "Artisanal Cortado Coffee","price": 380,"category": "Quick Bites","image": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80"},
      {"id": "cd-2","name": "Sourdough Avocado Toast & Seeds","price": 580,"category": "Brunch","image": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=80"},
      {"id": "cd-3","name": "Cinnamon Sugar Bakery Roll","price": 320,"category": "Quick Bites","image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80"},
      {"id": "cd-4","name": "Chef Special Smoked Duck & Truffle Benedict","price": 890,"category": "Fine Dining","image": "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?auto=format&fit=crop&w=400&q=80"}
    ]
  },
  {
    "id": "food-6",
    "name": "Subway Fresh Gourmet",
    "category": "Food",
    "floor": "2nd Floor",
    "zone": "Food Court South",
    "visitorsToday": 710,
    "ordersCount": 310,
    "reservationsCount": 0,
    "conversionRate": 46.2,
    "revenueToday": 280000,
    "status": "Open",
    "manager": "Vikram S.",
    "phone": "+91 98888 12345",
    "openHours": "10:00 AM - 11:00 PM",
    "rating": 4.6,
    "logo": "🥪",
    "items": [
      {"id": "sw-1","name": "Italian B.M.T. Sub","price": 450,"category": "Quick Bites","image": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=400&q=80"},
      {"id": "sw-2","name": "Egg & Roasted Chicken Morning Wrap","price": 380,"category": "Brunch","image": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80"},
      {"id": "sw-3","name": "Triple Chocolate Cookie Delight Box","price": 290,"category": "Quick Bites","image": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=400&q=80"},
      {"id": "sw-4","name": "Gourmet Steak & Cheese Signature Platter","price": 790,"category": "Fine Dining","image": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400&q=80"}
    ]
  },

  // FASHION & APPAREL (6 STORES)
  {
    "id": "fashion-1",
    "name": "Nike Flagship",
    "category": "Fashion",
    "floor": "1st Floor",
    "zone": "North Wing",
    "visitorsToday": 640,
    "ordersCount": 185,
    "reservationsCount": 12,
    "conversionRate": 42.1,
    "revenueToday": 845000,
    "status": "Open",
    "manager": "Marcus Vance",
    "phone": "+91 98222 33445",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.8,
    "logo": "👟",
    "items": [
      {"id": "nk-1","name": "Air Jordan 1 Retro High OG","price": 16995,"category": "Shoes","image": "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=400&q=80"},
      {"id": "nk-2","name": "Nike Air Max 270 React Sneakers","price": 13495,"category": "Shoes","image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80"},
      {"id": "nk-3","name": "Tech Fleece Oversized Hoodie","price": 8995,"category": "Hoodies","image": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80"},
      {"id": "nk-4","name": "Dri-FIT Athletic Training T-Shirt","price": 2995,"category": "T-Shirts","image": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80"},
      {"id": "nk-5","name": "Nike Sportswear Warmup Button Shirt","price": 4995,"category": "Shirts","image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80"},
      {"id": "nk-6","name": "Tech Fleece Slim Tapered Joggers","price": 7495,"category": "Pants","image": "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=400&q=80"}
    ]
  },
  {
    "id": "fashion-2",
    "name": "Zara Flagship",
    "category": "Fashion",
    "floor": "1st Floor",
    "zone": "South Wing",
    "visitorsToday": 720,
    "ordersCount": 210,
    "reservationsCount": 6,
    "conversionRate": 34.2,
    "revenueToday": 620000,
    "status": "Open",
    "manager": "Elena Rostova",
    "phone": "+91 98444 55667",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.6,
    "logo": "👗",
    "items": [
      {"id": "zr-1","name": "Casual Regular Fit Linen Shirt","price": 3590,"category": "Shirts","image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80"},
      {"id": "zr-2","name": "Heavyweight Unisex Fleece Hoodie","price": 4990,"category": "Hoodies","image": "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=400&q=80"},
      {"id": "zr-3","name": "Basic Heavy Cotton Crewneck T-Shirt","price": 1990,"category": "T-Shirts","image": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80"},
      {"id": "zr-4","name": "Tailored Straight Fit Trousers","price": 4590,"category": "Pants","image": "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=400&q=80"},
      {"id": "zr-5","name": "Chunky Sole Leather Derby Shoes","price": 6990,"category": "Shoes","image": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80"}
    ]
  },
  {
    "id": "fashion-3",
    "name": "Gucci Boutique",
    "category": "Fashion",
    "floor": "Ground Floor",
    "zone": "North Wing",
    "visitorsToday": 210,
    "ordersCount": 18,
    "reservationsCount": 14,
    "conversionRate": 22.0,
    "revenueToday": 2150000,
    "status": "Open",
    "manager": "Fabrizio Rossi",
    "phone": "+91 98666 77889",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.9,
    "logo": "👜",
    "items": [
      {"id": "gc-1","name": "Silk Web Stripe Bowling Shirt","price": 98000,"category": "Shirts","image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80"},
      {"id": "gc-2","name": "Gucci Logo Print Heavyweight Hoodie","price": 115000,"category": "Hoodies","image": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80"},
      {"id": "gc-3","name": "GG Monogram Cotton Crew T-Shirt","price": 48000,"category": "T-Shirts","image": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80"},
      {"id": "gc-4","name": "GG Jacquard Tailored Formal Pants","price": 88000,"category": "Pants","image": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80"},
      {"id": "gc-5","name": "Princetown Leather Slippers & Shoes","price": 75000,"category": "Shoes","image": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80"}
    ]
  },
  {
    "id": "fashion-4",
    "name": "Prada Atelier",
    "category": "Fashion",
    "floor": "Ground Floor",
    "zone": "South Wing",
    "visitorsToday": 205,
    "ordersCount": 14,
    "reservationsCount": 11,
    "conversionRate": 21.0,
    "revenueToday": 1980000,
    "status": "Open",
    "manager": "Matteo Bellini",
    "phone": "+91 98234 56789",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.9,
    "logo": "👠",
    "items": [
      {"id": "pr-1","name": "Re-Nylon Oversized Button Shirt","price": 85000,"category": "Shirts","image": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80"},
      {"id": "pr-2","name": "Prada Triangle Logo Cotton T-Shirt","price": 42000,"category": "T-Shirts","image": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=400&q=80"},
      {"id": "pr-3","name": "Enamel Logo Heavy Zip Hoodie","price": 108000,"category": "Hoodies","image": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=400&q=80"},
      {"id": "pr-4","name": "Wool Gabardine Slim Trousers Pants","price": 78000,"category": "Pants","image": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=400&q=80"},
      {"id": "pr-5","name": "Monolith Chunky Leather Loafers Shoes","price": 92000,"category": "Shoes","image": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80"}
    ]
  },
  {
    "id": "fashion-5",
    "name": "U.S. Polo Assn.",
    "category": "Fashion",
    "floor": "1st Floor",
    "zone": "Central Atrium",
    "visitorsToday": 510,
    "ordersCount": 145,
    "reservationsCount": 4,
    "conversionRate": 31.8,
    "revenueToday": 450000,
    "status": "Open",
    "manager": "Rajesh K.",
    "phone": "+91 98444 88112",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.6,
    "logo": "🏇",
    "items": [
      {"id": "up-1","name": "Custom Fit Cotton Piqué Polo T-Shirt","price": 2999,"category": "T-Shirts","image": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=400&q=80"},
      {"id": "up-2","name": "Heritage Denim Oxford Button Shirt","price": 3499,"category": "Shirts","image": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80"},
      {"id": "up-3","name": "Quarter-Zip Knit Fleece Hoodie","price": 4499,"category": "Hoodies","image": "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=400&q=80"},
      {"id": "up-4","name": "Slim Fit Cotton Chino Pants","price": 3499,"category": "Pants","image": "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=400&q=80"},
      {"id": "up-5","name": "Embossed Leather Court Sneakers Shoes","price": 4299,"category": "Shoes","image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80"}
    ]
  },
  {
    "id": "fashion-6",
    "name": "H&M Flagship",
    "category": "Fashion",
    "floor": "1st Floor",
    "zone": "East Wing",
    "visitorsToday": 890,
    "ordersCount": 260,
    "reservationsCount": 3,
    "conversionRate": 35.5,
    "revenueToday": 340000,
    "status": "Open",
    "manager": "Sophie Lindqvist",
    "phone": "+91 98111 44556",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.5,
    "logo": "👕",
    "items": [
      {"id": "hm-1","name": "Relaxed Fit Linen Blend Shirt","price": 2299,"category": "Shirts","image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80"},
      {"id": "hm-2","name": "Heavy Cotton Essential T-Shirt","price": 1499,"category": "T-Shirts","image": "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=400&q=80"},
      {"id": "hm-3","name": "Oversized Heavy Cotton Printed Hoodie","price": 2799,"category": "Hoodies","image": "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=400&q=80"},
      {"id": "hm-4","name": "Slim Fit Cotton Chino Pants","price": 1999,"category": "Pants","image": "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=400&q=80"},
      {"id": "hm-5","name": "Chunky White Streetwear Sneakers Shoes","price": 3499,"category": "Shoes","image": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80"}
    ]
  },

  // BAGS & LEATHER (4 STORES)
  {
    "id": "acc-1",
    "name": "Louis Vuitton Maison",
    "category": "Accessories",
    "floor": "Ground Floor",
    "zone": "Central Atrium",
    "visitorsToday": 480,
    "ordersCount": 38,
    "reservationsCount": 19,
    "conversionRate": 24.1,
    "revenueToday": 3400000,
    "status": "Open",
    "manager": "Charlotte Dubois",
    "phone": "+91 98777 88990",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.9,
    "logo": "💎",
    "items": [
      {"id": "lv-1","name": "Neverfull MM Monogram Tote Bag","price": 165000,"category": "Bags & Leather","image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"},
      {"id": "lv-2","name": "Speedy Bandoulière 25 Leather Bag","price": 185000,"category": "Bags & Leather","image": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"},
      {"id": "lv-3","name": "Pochette Métis Monogram Crossbody Bag","price": 195000,"category": "Bags & Leather","image": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80"},
      {"id": "lv-4","name": "LV Millionaires Square Eyewear","price": 48000,"category": "Eyewear","image": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80"}
    ]
  },
  {
    "id": "acc-2",
    "name": "Hermès Leather Lounge",
    "category": "Accessories",
    "floor": "Ground Floor",
    "zone": "Central Atrium",
    "visitorsToday": 230,
    "ordersCount": 16,
    "reservationsCount": 14,
    "conversionRate": 18.5,
    "revenueToday": 4850000,
    "status": "Open",
    "manager": "Antoine Laurent",
    "phone": "+91 98888 12345",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 5.0,
    "logo": "👜",
    "items": [
      {"id": "hm-b1","name": "Birkin 30 Togo Gold Hardware Handbag","price": 1250000,"category": "Bags & Leather","image": "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80"},
      {"id": "hm-b2","name": "Kelly 28 Epsom Leather Retourne Bag","price": 1450000,"category": "Bags & Leather","image": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"},
      {"id": "hm-b3","name": "Constance 18 Box Calfskin Leather Bag","price": 890000,"category": "Bags & Leather","image": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80"}
    ]
  },
  {
    "id": "acc-5",
    "name": "Coach New York",
    "category": "Accessories",
    "floor": "1st Floor",
    "zone": "Central Atrium",
    "visitorsToday": 410,
    "ordersCount": 52,
    "reservationsCount": 8,
    "conversionRate": 31.0,
    "revenueToday": 1350000,
    "status": "Open",
    "manager": "Sarah Jenkins",
    "phone": "+91 98450 55667",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.7,
    "logo": "👜",
    "items": [
      {"id": "co-b1","name": "Tabby Shoulder Bag 26 Signature Leather","price": 49500,"category": "Bags & Leather","image": "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80"},
      {"id": "co-b2","name": "Willow Leather Tote Bag With Turnlock","price": 39500,"category": "Bags & Leather","image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"}
    ]
  },
  {
    "id": "acc-6",
    "name": "Bottega Veneta",
    "category": "Accessories",
    "floor": "Ground Floor",
    "zone": "East Wing",
    "visitorsToday": 260,
    "ordersCount": 22,
    "reservationsCount": 12,
    "conversionRate": 21.5,
    "revenueToday": 2890000,
    "status": "Open",
    "manager": "Matteo Rinaldi",
    "phone": "+91 98450 77889",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.9,
    "logo": "🌿",
    "items": [
      {"id": "bv-b1","name": "Jodie Mini Intrecciato Woven Leather Bag","price": 210000,"category": "Bags & Leather","image": "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80"},
      {"id": "bv-b2","name": "Cassette Crossbody Padded Woven Leather","price": 195000,"category": "Bags & Leather","image": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80"}
    ]
  },

  // JEWELRY (6 STORES)
  {
    "id": "acc-7",
    "name": "Tiffany & Co.",
    "category": "Accessories",
    "floor": "Ground Floor",
    "zone": "North Wing",
    "visitorsToday": 320,
    "ordersCount": 26,
    "reservationsCount": 22,
    "conversionRate": 25.0,
    "revenueToday": 3890000,
    "status": "Open",
    "manager": "Eleanor Vance",
    "phone": "+91 98123 45678",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.9,
    "logo": "💍",
    "items": [
      {"id": "tf-1","name": "Tiffany T1 Diamond Ring 18k Gold","price": 215000,"category": "Jewelry","image": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"},
      {"id": "tf-2","name": "HardWear Graduated Link Necklace","price": 480000,"category": "Jewelry","image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"},
      {"id": "tf-3","name": "Victoria Vine Diamond Pendant Platinum","price": 350000,"category": "Jewelry","image": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"}
    ]
  },
  {
    "id": "acc-8",
    "name": "Cartier High Jewelry",
    "category": "Accessories",
    "floor": "Ground Floor",
    "zone": "South Wing",
    "visitorsToday": 380,
    "ordersCount": 32,
    "reservationsCount": 24,
    "conversionRate": 20.0,
    "revenueToday": 4120000,
    "status": "Open",
    "manager": "Elena Rossi",
    "phone": "+91 98765 43236",
    "openHours": "10:00 AM - 09:30 PM",
    "rating": 4.9,
    "logo": "💎",
    "items": [
      {"id": "cj-1","name": "LOVE Bracelet 18k Yellow Gold Jewelry","price": 680000,"category": "Jewelry","image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"},
      {"id": "cj-2","name": "Panthère de Cartier Diamond Ring","price": 890000,"category": "Jewelry","image": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"},
      {"id": "cj-3","name": "Juste un Clou Diamond Bracelet 18k Gold","price": 950000,"category": "Jewelry","image": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"}
    ]
  },
  {
    "id": "acc-9",
    "name": "Bvlgari Haute Joaillerie",
    "category": "Accessories",
    "floor": "Ground Floor",
    "zone": "Central Atrium",
    "visitorsToday": 210,
    "ordersCount": 18,
    "reservationsCount": 16,
    "conversionRate": 19.0,
    "revenueToday": 3650000,
    "status": "Open",
    "manager": "Marco V.",
    "phone": "+91 98222 99887",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.9,
    "logo": "🐍",
    "items": [
      {"id": "bvl-1","name": "Serpenti Viper 18k Rose Gold Diamond Ring","price": 540000,"category": "Jewelry","image": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"},
      {"id": "bvl-2","name": "B.zero1 18k Gold Spiral Pendant Necklace","price": 380000,"category": "Jewelry","image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"}
    ]
  },
  {
    "id": "acc-10",
    "name": "Swarovski Crystal Pavilion",
    "category": "Accessories",
    "floor": "1st Floor",
    "zone": "East Wing",
    "visitorsToday": 490,
    "ordersCount": 85,
    "reservationsCount": 5,
    "conversionRate": 28.0,
    "revenueToday": 680000,
    "status": "Open",
    "manager": "Clara M.",
    "phone": "+91 98111 88776",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.7,
    "logo": "🦢",
    "items": [
      {"id": "sw-1","name": "Millenia Tennis Bracelet Clear Crystal","price": 16500,"category": "Jewelry","image": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80"},
      {"id": "sw-2","name": "Dextera Octagonal Pavé Hoop Earrings","price": 18500,"category": "Jewelry","image": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"},
      {"id": "sw-3","name": "Mesmera Diamond Cut Crystal Choker","price": 24900,"category": "Jewelry","image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"}
    ]
  },
  {
    "id": "acc-11",
    "name": "Tanishq Royal Heritage",
    "category": "Accessories",
    "floor": "Ground Floor",
    "zone": "West Wing",
    "visitorsToday": 620,
    "ordersCount": 110,
    "reservationsCount": 28,
    "conversionRate": 32.5,
    "revenueToday": 5400000,
    "status": "Open",
    "manager": "Ramesh Kumar",
    "phone": "+91 98450 11223",
    "openHours": "10:00 AM - 09:30 PM",
    "rating": 4.9,
    "logo": "👑",
    "items": [
      {"id": "tq-1","name": "Kundan Diamond Bridal Choker Set","price": 480000,"category": "Jewelry","image": "https://images.unsplash.com/photo-1611591475152-47e2a1dddb99?auto=format&fit=crop&w=800&q=80"},
      {"id": "tq-2","name": "Rivaah 22k Solid Gold Temple Necklace","price": 340000,"category": "Jewelry","image": "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80"},
      {"id": "tq-3","name": "Polki Royal Emerald Studded Bangles","price": 275000,"category": "Jewelry","image": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"}
    ]
  },
  {
    "id": "acc-12",
    "name": "Malabar Gold & Diamonds",
    "category": "Accessories",
    "floor": "Ground Floor",
    "zone": "West Wing",
    "visitorsToday": 580,
    "ordersCount": 98,
    "reservationsCount": 20,
    "conversionRate": 30.0,
    "revenueToday": 4890000,
    "status": "Open",
    "manager": "Suresh Menon",
    "phone": "+91 98450 44556",
    "openHours": "10:00 AM - 09:30 PM",
    "rating": 4.8,
    "logo": "💎",
    "items": [
      {"id": "mg-1","name": "Mine Solitaire Diamond Necklace Set","price": 520000,"category": "Jewelry","image": "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80"},
      {"id": "mg-2","name": "Era Uncut Diamond Royal Jhumkas","price": 185000,"category": "Jewelry","image": "https://images.unsplash.com/photo-1611591475152-47e2a1dddb99?auto=format&fit=crop&w=800&q=80"},
      {"id": "mg-3","name": "Precia Ruby & Emerald Gold Choker","price": 390000,"category": "Jewelry","image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"}
    ]
  },

  // EYEWEAR (5 STORES)
  {
    "id": "acc-13",
    "name": "Ray-Ban Sunglass Hut",
    "category": "Accessories",
    "floor": "1st Floor",
    "zone": "West Wing",
    "visitorsToday": 530,
    "ordersCount": 68,
    "reservationsCount": 0,
    "conversionRate": 23.4,
    "revenueToday": 210000,
    "status": "Open",
    "manager": "Kavita B.",
    "phone": "+91 98765 43247",
    "openHours": "10:00 AM - 09:30 PM",
    "rating": 4.7,
    "logo": "🕶️",
    "items": [
      {"id": "rb-1","name": "Ray-Ban Aviator Classic Polarized G-15","price": 12990,"category": "Eyewear","image": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80"},
      {"id": "rb-2","name": "Ray-Ban Wayfarer Classic Black G-15","price": 11490,"category": "Eyewear","image": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80"},
      {"id": "rb-3","name": "Ray-Ban Clubmaster Classic Browline Shades","price": 13590,"category": "Eyewear","image": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=800&q=80"}
    ]
  },
  {
    "id": "acc-14",
    "name": "Sunglass Hut Premier",
    "category": "Accessories",
    "floor": "1st Floor",
    "zone": "Central Atrium",
    "visitorsToday": 410,
    "ordersCount": 55,
    "reservationsCount": 0,
    "conversionRate": 22.0,
    "revenueToday": 390000,
    "status": "Open",
    "manager": "Amitabh R.",
    "phone": "+91 98222 33441",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.6,
    "logo": "🕶️",
    "items": [
      {"id": "sh-1","name": "Versace Medusa Biggie Luxury Sunglasses","price": 28500,"category": "Eyewear","image": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80"},
      {"id": "sh-2","name": "Burberry Vintage Check Square Sunglasses","price": 24900,"category": "Eyewear","image": "https://images.unsplash.com/photo-1509695503495-cd91217e57c6?auto=format&fit=crop&w=800&q=80"},
      {"id": "sh-3","name": "Oliver Peoples Gregory Peck Round Frames","price": 32000,"category": "Eyewear","image": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=800&q=80"}
    ]
  },
  {
    "id": "acc-15",
    "name": "Oakley Performance Vision",
    "category": "Accessories",
    "floor": "1st Floor",
    "zone": "North Wing",
    "visitorsToday": 380,
    "ordersCount": 42,
    "reservationsCount": 0,
    "conversionRate": 21.0,
    "revenueToday": 280000,
    "status": "Open",
    "manager": "Rohan D.",
    "phone": "+91 98111 22338",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.7,
    "logo": "🔴",
    "items": [
      {"id": "ok-1","name": "Oakley Holbrook Polarized Prizm Black","price": 15490,"category": "Eyewear","image": "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80"},
      {"id": "ok-2","name": "Oakley Radar EV Path Sport Sunglasses","price": 18990,"category": "Eyewear","image": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80"},
      {"id": "ok-3","name": "Oakley Frogskins Classic Heritage Shades","price": 11990,"category": "Eyewear","image": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80"}
    ]
  },
  {
    "id": "acc-16",
    "name": "Tom Ford Eyewear",
    "category": "Accessories",
    "floor": "Ground Floor",
    "zone": "South Wing",
    "visitorsToday": 290,
    "ordersCount": 28,
    "reservationsCount": 10,
    "conversionRate": 20.0,
    "revenueToday": 890000,
    "status": "Open",
    "manager": "Vanessa L.",
    "phone": "+91 98450 99001",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.9,
    "logo": "🕶️",
    "items": [
      {"id": "tfe-1","name": "Tom Ford Snowdon Vintage Square Sunglasses","price": 38000,"category": "Eyewear","image": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=800&q=80"},
      {"id": "tfe-2","name": "Tom Ford Arnaud Aviator Gold Sunglasses","price": 42000,"category": "Eyewear","image": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80"},
      {"id": "tfe-3","name": "Tom Ford FT5178 Vintage Optical Glasses","price": 34000,"category": "Eyewear","image": "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80"}
    ]
  },
  {
    "id": "acc-17",
    "name": "Lenskart Gold Lounge",
    "category": "Accessories",
    "floor": "1st Floor",
    "zone": "East Wing",
    "visitorsToday": 650,
    "ordersCount": 180,
    "reservationsCount": 0,
    "conversionRate": 34.0,
    "revenueToday": 420000,
    "status": "Open",
    "manager": "Pooja V.",
    "phone": "+91 98888 77665",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.6,
    "logo": "👓",
    "items": [
      {"id": "lk-1","name": "John Jacobs Titanium Japanese Aviator Eyeglasses","price": 7500,"category": "Eyewear","image": "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80"},
      {"id": "lk-2","name": "Vincent Chase Polarized Clubmaster Sunglasses","price": 3500,"category": "Eyewear","image": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=800&q=80"},
      {"id": "lk-3","name": "Air Flex Featherlight Frameless Eyeglasses","price": 5000,"category": "Eyewear","image": "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80"}
    ]
  },

  // WATCHES (6 STORES)
  {
    "id": "acc-18",
    "name": "Rolex Boutique",
    "category": "Accessories",
    "floor": "Ground Floor",
    "zone": "Central Atrium",
    "visitorsToday": 310,
    "ordersCount": 24,
    "reservationsCount": 8,
    "conversionRate": 28.5,
    "revenueToday": 2900000,
    "status": "Open",
    "manager": "Claire Montrose",
    "phone": "+91 98111 22334",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.9,
    "logo": "👑",
    "items": [
      {"id": "rx-1","name": "Submariner Date 41mm Oystersteel Watch","price": 1450000,"category": "Watches","image": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"},
      {"id": "rx-2","name": "Day-Date 40 Everose Gold President Watch","price": 3200000,"category": "Watches","image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"},
      {"id": "rx-3","name": "Cosmograph Daytona Oystersteel Chronograph","price": 2100000,"category": "Watches","image": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"}
    ]
  },
  {
    "id": "acc-19",
    "name": "Omega Watch Atelier",
    "category": "Accessories",
    "floor": "Ground Floor",
    "zone": "Central Atrium",
    "visitorsToday": 280,
    "ordersCount": 20,
    "reservationsCount": 12,
    "conversionRate": 22.0,
    "revenueToday": 2450000,
    "status": "Open",
    "manager": "Julian Thorne",
    "phone": "+91 98333 11223",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.9,
    "logo": "Ω",
    "items": [
      {"id": "om-1","name": "Speedmaster Moonwatch Professional Chronograph","price": 720000,"category": "Watches","image": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"},
      {"id": "om-2","name": "Seamaster Diver 300M Co-Axial Master Chronometer","price": 560000,"category": "Watches","image": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"},
      {"id": "om-3","name": "Constellation Co-Axial Master Chronometer","price": 680000,"category": "Watches","image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"}
    ]
  },
  {
    "id": "acc-20",
    "name": "TAG Heuer Flagship",
    "category": "Accessories",
    "floor": "1st Floor",
    "zone": "North Wing",
    "visitorsToday": 340,
    "ordersCount": 26,
    "reservationsCount": 10,
    "conversionRate": 21.0,
    "revenueToday": 1890000,
    "status": "Open",
    "manager": "Lukas Weber",
    "phone": "+91 98222 44556",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.8,
    "logo": "⏱️",
    "items": [
      {"id": "th-1","name": "TAG Heuer Carrera Chronograph Automatic 42mm","price": 480000,"category": "Watches","image": "https://images.unsplash.com/photo-1547996160-71dfabbce5ed?auto=format&fit=crop&w=800&q=80"},
      {"id": "th-2","name": "TAG Heuer Monaco Calibre 11 Gulf Special Edition","price": 620000,"category": "Watches","image": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"},
      {"id": "th-3","name": "TAG Heuer Aquaracer Professional 300 Diver","price": 290000,"category": "Watches","image": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"}
    ]
  },
  {
    "id": "acc-21",
    "name": "Apple Experience Store",
    "category": "Accessories",
    "floor": "Ground Floor",
    "zone": "East Wing",
    "visitorsToday": 890,
    "ordersCount": 142,
    "reservationsCount": 35,
    "conversionRate": 38.6,
    "revenueToday": 4120000,
    "status": "Open",
    "manager": "David Miller",
    "phone": "+91 98333 44556",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.9,
    "logo": "🍎",
    "items": [
      {"id": "ap-1","name": "Apple Watch Ultra 2 Titanium GPS + Cellular","price": 89900,"category": "Watches","image": "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=800&q=80"},
      {"id": "ap-2","name": "Apple Watch Series 9 GPS 45mm Aluminum","price": 54900,"category": "Watches","image": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80"},
      {"id": "ap-3","name": "Apple Vision Pro Spatial Computing Headset","price": 349900,"category": "Eyewear","image": "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&w=800&q=80"}
    ]
  },
  {
    "id": "acc-22",
    "name": "Tissot Swiss Watches",
    "category": "Accessories",
    "floor": "1st Floor",
    "zone": "West Wing",
    "visitorsToday": 420,
    "ordersCount": 38,
    "reservationsCount": 5,
    "conversionRate": 24.0,
    "revenueToday": 980000,
    "status": "Open",
    "manager": "Felix B.",
    "phone": "+91 98765 11223",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.7,
    "logo": "🇨🇭",
    "items": [
      {"id": "ts-1","name": "Tissot PRX Powermatic 80 Integrated Bracelet Watch","price": 62500,"category": "Watches","image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"},
      {"id": "ts-2","name": "Tissot Seastar 1000 Automatic Professional Diver","price": 78000,"category": "Watches","image": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"}
    ]
  },
  {
    "id": "acc-23",
    "name": "Titan Nebula Gold Watches",
    "category": "Accessories",
    "floor": "1st Floor",
    "zone": "Central Atrium",
    "visitorsToday": 390,
    "ordersCount": 32,
    "reservationsCount": 8,
    "conversionRate": 23.5,
    "revenueToday": 1450000,
    "status": "Open",
    "manager": "Venkat R.",
    "phone": "+91 98450 66778",
    "openHours": "10:00 AM - 10:00 PM",
    "rating": 4.8,
    "logo": "👑",
    "items": [
      {"id": "tn-1","name": "Nebula 18k Solid Gold Chronograph Watch","price": 285000,"category": "Watches","image": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"},
      {"id": "tn-2","name": "Nebula Calligraphy Diamond 18k Gold Watch","price": 195000,"category": "Watches","image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"}
    ]
  }
];



let connectedUsers = [
  { id: 'usr-101', name: 'yoshi', phone: '+91 84950 93170', macAddress: 'A4:C3:F0:88:99:A1', ipAddress: '192.168.10.101', connectionTime: '10:15 AM', sessionDuration: '42 mins', visitedStores: ['Nike Flagship', 'Starbucks Reserve'], dataUsed: '340 MB', status: 'Active', vipStatus: true, zone: '1st Floor (Fashion)', deviceType: 'iOS' },
  { id: 'usr-102', name: 'Aastha Sharma', phone: '+91 98123 98765', macAddress: 'B2:E4:11:22:33:44', ipAddress: '192.168.10.102', connectionTime: '10:28 AM', sessionDuration: '29 mins', visitedStores: ['Nike Flagship', 'Zara Flagship'], dataUsed: '210 MB', status: 'Active', vipStatus: false, zone: 'North Wing', deviceType: 'Android' },
  { id: 'usr-103', name: 'Reynold Ricky', phone: '+91 98987 65432', macAddress: 'C6:F8:44:55:66:77', ipAddress: '192.168.10.103', connectionTime: '10:45 AM', sessionDuration: '12 mins', visitedStores: ['Apple Experience Store'], dataUsed: '145 MB', status: 'Active', vipStatus: true, zone: 'East Wing', deviceType: 'macOS' }
];

let orders = [
  { id: 'ORD-1089', orderNumber: '#AX-1089', customerName: 'yoshi', customerPhone: '+91 84950 93170', storeName: 'Rolex Boutique', storeCategory: 'Luxury', itemsCount: 1, itemsList: ['Submariner Date Oystersteel Watch'], totalAmount: 1450000, orderType: 'Store Pickup', paymentMethod: 'UPI / GPay', timestamp: '10:42 AM', status: 'Completed' },
  { id: 'ORD-1090', orderNumber: '#AX-1090', customerName: 'Aastha Sharma', customerPhone: '+91 98123 98765', storeName: 'Nike Flagship', storeCategory: 'Fashion', itemsCount: 1, itemsList: ['Air Jordan 1 Retro High OG'], totalAmount: 16995, orderType: 'Click & Collect', paymentMethod: 'Credit Card', timestamp: '10:48 AM', status: 'Completed' }
];

let reservations = [
  { id: 'RES-301', refCode: 'RES-8821', guestName: 'yoshi', guestPhone: '+91 84950 93170', storeName: 'Starbucks Reserve', partySize: 2, timeSlot: '17:00 PM', date: '2026-08-14', status: 'Confirmed', specialNotes: 'VIP Corner Seating' },
  { id: 'RES-302', refCode: 'RES-8822', guestName: 'Pudina Kumar', guestPhone: '+91 98754 36789', storeName: 'Rolex Boutique', partySize: 1, timeSlot: '17:00 PM', date: '2026-08-14', status: 'Confirmed', specialNotes: 'Private VIP Fitting Suite' }
];

let coupons = [
  { id: 'cpn-1', code: 'NIKEVIP15', title: '15% Off Nike Apparel & Shoes', discount: '15% OFF', storeName: 'Nike Flagship', category: 'Fashion', issuedCount: 1500, redeemedCount: 342, expiryDate: '2026-08-31', status: 'Active', targetSegment: 'All Mall Guests', discountType: 'percentage', discountValue: 15, maxDiscount: 3000 },
  { id: 'cpn-2', code: 'ZARASUMMER10', title: '10% Off Zara Summer Collection', discount: '10% OFF', storeName: 'Zara Flagship', category: 'Fashion', issuedCount: 2000, redeemedCount: 520, expiryDate: '2026-08-31', status: 'Active', targetSegment: 'Fashion Lovers', discountType: 'percentage', discountValue: 10, maxDiscount: 2000 },
  { id: 'cpn-3', code: 'GUCCIEXCLUSIVE', title: 'Flat ₹10,000 Off Luxury Orders', discount: '₹10,000 OFF', storeName: 'Gucci Boutique', category: 'Luxury', issuedCount: 500, redeemedCount: 88, expiryDate: '2026-08-31', status: 'Active', targetSegment: 'VIP Shoppers', discountType: 'flat', discountValue: 10000, maxDiscount: 10000 },
  { id: 'cpn-4', code: 'GRANDMALL20', title: '20% Off Concierge Order (Max ₹5,000)', discount: '20% OFF', storeName: 'The Grand Mall', category: 'All Stores', issuedCount: 3000, redeemedCount: 890, expiryDate: '2026-08-31', status: 'Active', targetSegment: 'WiFi Captive Portal Users', discountType: 'percentage', discountValue: 20, maxDiscount: 5000 },
  { id: 'cpn-5', code: 'STARBUCKSFREE', title: 'Flat ₹300 Off Starbucks Brunch', discount: '₹300 OFF', storeName: 'Starbucks Reserve', category: 'Food', issuedCount: 2200, redeemedCount: 680, expiryDate: '2026-08-31', status: 'Active', targetSegment: 'Coffee & Brunch Diners', discountType: 'flat', discountValue: 300, maxDiscount: 300 }
];

let couponRedemptions = [
  { id: 'rdm-101', couponId: 'cpn-1', couponCode: 'NIKEVIP15', customerName: 'yoshi', customerPhone: '+91 84950 93170', redeemedAt: '12 mins ago', storeName: 'Nike Flagship', discountApplied: '15% OFF', savingsAmount: '₹2,549 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1090', vipStatus: true },
  { id: 'rdm-102', couponId: 'cpn-1', couponCode: 'NIKEVIP15', customerName: 'Aastha Sharma', customerPhone: '+91 98123 98765', redeemedAt: '25 mins ago', storeName: 'Nike Flagship', discountApplied: '15% OFF', savingsAmount: '₹2,379 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1088', vipStatus: true },
  { id: 'rdm-103', couponId: 'cpn-1', couponCode: 'NIKEVIP15', customerName: 'Mahima Roy', customerPhone: '+91 98123 45678', redeemedAt: '42 mins ago', storeName: 'Nike Flagship', discountApplied: '15% OFF', savingsAmount: '₹1,850 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1075', vipStatus: true },

  { id: 'rdm-201', couponId: 'cpn-2', couponCode: 'ZARASUMMER10', customerName: 'Aastha Sharma', customerPhone: '+91 98123 98765', redeemedAt: '18 mins ago', storeName: 'Zara Flagship', discountApplied: '10% OFF', savingsAmount: '₹499 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1088', vipStatus: true },
  { id: 'rdm-202', couponId: 'cpn-2', couponCode: 'ZARASUMMER10', customerName: 'yoshi', customerPhone: '+91 84950 93170', redeemedAt: '35 mins ago', storeName: 'Zara Flagship', discountApplied: '10% OFF', savingsAmount: '₹359 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1082', vipStatus: true },
  { id: 'rdm-203', couponId: 'cpn-2', couponCode: 'ZARASUMMER10', customerName: 'Natasha Fernandez', customerPhone: '+91 98999 11122', redeemedAt: '1 hour ago', storeName: 'Zara Flagship', discountApplied: '10% OFF', savingsAmount: '₹459 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1060', vipStatus: false },

  { id: 'rdm-301', couponId: 'cpn-3', couponCode: 'GUCCIEXCLUSIVE', customerName: 'Priya Sharma', customerPhone: '+91 98345 67890', redeemedAt: '30 mins ago', storeName: 'Gucci Boutique', discountApplied: '₹10,000 OFF', savingsAmount: '₹10,000 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1085', vipStatus: true },
  { id: 'rdm-302', couponId: 'cpn-3', couponCode: 'GUCCIEXCLUSIVE', customerName: 'yoshi', customerPhone: '+91 84950 93170', redeemedAt: '50 mins ago', storeName: 'Gucci Boutique', discountApplied: '₹10,000 OFF', savingsAmount: '₹10,000 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1078', vipStatus: true },

  { id: 'rdm-401', couponId: 'cpn-4', couponCode: 'GRANDMALL20', customerName: 'Reynold Ricky', customerPhone: '+91 98987 65432', redeemedAt: '45 mins ago', storeName: 'The Grand Mall', discountApplied: '20% OFF', savingsAmount: '₹3,200 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1080', vipStatus: true },
  { id: 'rdm-402', couponId: 'cpn-4', couponCode: 'GRANDMALL20', customerName: 'yoshi', customerPhone: '+91 84950 93170', redeemedAt: '1 hour ago', storeName: 'The Grand Mall', discountApplied: '20% OFF', savingsAmount: '₹2,500 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1065', vipStatus: true },

  { id: 'rdm-501', couponId: 'cpn-5', couponCode: 'STARBUCKSFREE', customerName: 'Mahima Roy', customerPhone: '+91 98123 45678', redeemedAt: '1 hour ago', storeName: 'Starbucks Reserve', discountApplied: '₹300 OFF', savingsAmount: '₹300 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1072', vipStatus: true },
  { id: 'rdm-502', couponId: 'cpn-5', couponCode: 'STARBUCKSFREE', customerName: 'Ananya Sharma', customerPhone: '+91 98555 66778', redeemedAt: '2 hours ago', storeName: 'Starbucks Reserve', discountApplied: '₹300 OFF', savingsAmount: '₹300 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1050', vipStatus: false },

  { id: 'rdm-601', couponId: 'cpn-6', couponCode: 'ROLEX5000', customerName: 'yoshi', customerPhone: '+91 84950 93170', redeemedAt: '10:42 AM', storeName: 'Rolex Boutique', discountApplied: '₹5,000 OFF', savingsAmount: '₹5,000 Saved', channel: 'WiFi Captive Portal', orderNumber: '#AX-1089', vipStatus: true }
];

let activityLogs = [
  { id: 'act-1', timestamp: '10:42 AM', userName: 'yoshi', action: 'ordered', detail: 'Purchased Submariner Date (₹1,450,000)', storeName: 'Rolex Boutique', badgeType: 'purple' },
  { id: 'act-2', timestamp: '10:48 AM', userName: 'Aastha Sharma', action: 'ordered', detail: 'Purchased Air Jordan 1 Retro (₹16,995)', storeName: 'Nike Flagship', badgeType: 'blue' }
];

// SSE Clients Registry
let sseClients = [];

function broadcastEvent(type, data) {
  const payload = `data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`;
  sseClients.forEach(client => client.res.write(payload));
}

// Express middleware for live Supabase hydration on Vercel requests
app.use(async (req, res, next) => {
  if (process.env.VERCEL) {
    try {
      await hydrateBackendFromSupabase();
    } catch (e) {}
  }
  next();
});

// 0. Root Endpoint — Live Mall Digital Twin Overview (White/Light Theme & Interactive Modals)
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en" class="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AXIONIX Mall Twin — Standalone 2D Spatial Map</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #0f172a; }
    .card-light { background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05); }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen flex flex-col selection:bg-blue-600 selection:text-white">

  <!-- TOP HEADER BAR -->
  <header class="border-b border-slate-200/90 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20">
          AX
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="text-lg font-black tracking-tight text-slate-900">AXIONIX Mall Twin</h1>
            <span class="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-widest">
              STANDALONE SPATIAL MAP
            </span>
          </div>
          <p class="text-xs text-slate-500 font-medium">Interactive 2D Spatial Floor Plan & Store Telemetry Engine</p>
        </div>
      </div>

      <!-- PORTAL DIRECT NAVIGATION BUTTONS -->
      <div class="flex items-center space-x-3">
        <a href="http://localhost:3000" target="_blank" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 flex items-center space-x-2 cursor-pointer">
          <span>🏢 Open Admin Dashboard ↗</span>
        </a>
        <a href="http://localhost:3001" target="_blank" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center space-x-2 cursor-pointer">
          <span>📱 Open Guest Wifi Portal ↗</span>
        </a>
      </div>
    </div>
  </header>

  <!-- MAIN SPATIAL CONTAINER -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">

    <!-- METRICS SUMMARY CARDS -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <div onclick="openUsersModal()" class="card-light rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500/60 hover:shadow-md transition-all cursor-pointer group bg-white">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-blue-600">Total Footfall</span>
        <div class="mt-2 flex items-baseline justify-between">
          <span id="metric-footfall" class="text-2xl font-black text-slate-900">4,965</span>
          <span class="text-xs text-emerald-600 font-extrabold flex items-center">↑ Live</span>
        </div>
        <p class="text-[10px] text-slate-400 mt-1 font-medium">Live Sensor Telemetry</p>
      </div>

      <div onclick="openOrdersModal()" class="card-light rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/60 hover:shadow-md transition-all cursor-pointer group bg-white">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-emerald-600">Gross Revenue Today</span>
        <div class="mt-2 flex items-baseline justify-between">
          <span id="metric-revenue" class="text-2xl font-black text-emerald-600">₹19.5M</span>
          <span class="text-xs text-emerald-600 font-extrabold flex items-center">↑ POS</span>
        </div>
        <p class="text-[10px] text-slate-400 mt-1 font-medium">Real-time POS Synced</p>
      </div>

      <div onclick="openUsersModal()" class="card-light rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500/60 hover:shadow-md transition-all cursor-pointer group bg-white">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-blue-600">Connected WiFi Users</span>
        <div class="mt-2 flex items-baseline justify-between">
          <span id="metric-users" class="text-2xl font-black text-blue-600">6 Active</span>
          <span class="text-xs text-blue-600 font-extrabold">Online</span>
        </div>
        <p class="text-[10px] text-slate-400 mt-1 font-medium">Captive Gateway Sessions</p>
      </div>

      <div onclick="openStoresModal()" class="card-light rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/60 hover:shadow-md transition-all cursor-pointer group bg-white">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-amber-600">Open Flagships</span>
        <div class="mt-2 flex items-baseline justify-between">
          <span id="metric-stores" class="text-2xl font-black text-amber-600">18 Stores</span>
          <span class="text-xs text-amber-600 font-extrabold">100% Active</span>
        </div>
        <p class="text-[10px] text-slate-400 mt-1 font-medium">All Zones Operational</p>
      </div>

      <div onclick="openOrdersModal()" class="card-light rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/60 hover:shadow-md transition-all cursor-pointer group bg-white">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-purple-600">Orders & Reservations</span>
        <div class="mt-2 flex items-baseline justify-between">
          <span id="metric-orders" class="text-2xl font-black text-purple-600">4 Orders</span>
          <span class="text-xs text-purple-600 font-extrabold">Live Sync</span>
        </div>
        <p class="text-[10px] text-slate-400 mt-1 font-medium">Realtime Fulfilled</p>
      </div>
    </div>

    <!-- MAIN SPATIAL TWIN MAP CARD -->
    <div class="card-light rounded-3xl p-6 lg:p-8 space-y-6 bg-white border border-slate-200">

      <!-- MAP CARD HEADER BAR -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 text-lg">
            🗺️
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <h2 class="text-xl font-extrabold text-slate-900 tracking-tight">AXIONIX 2D Spatial Twin Map</h2>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-widest">
                Live Spatial Engine
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5 font-medium">Interactive polygon zones, real-time footfall density heatmap, and live store pins</p>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <button id="btn-heatmap-toggle" onclick="toggleHeatmapOverlay()" class="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-md shadow-rose-600/20 flex items-center space-x-2 cursor-pointer transition-all">
            <span>🔥 Heatmap Overlay</span>
          </button>
          <button onclick="resetMapView()" class="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer" title="Reset View">
            🔄
          </button>
        </div>
      </div>

      <!-- FLOOR SELECTOR TABS -->
      <div class="flex items-center space-x-2 overflow-x-auto pb-1">
        <button onclick="switchFloor('All Stores')" id="btn-fl-all" class="px-5 py-2.5 text-xs font-extrabold rounded-xl transition-all bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 cursor-pointer">All Stores (33)</button>
        <button onclick="switchFloor('Ground Floor')" id="btn-fl-0" class="px-5 py-2.5 text-xs font-extrabold rounded-xl transition-all bg-blue-600 text-white shadow-md shadow-blue-600/20 cursor-pointer">Ground Floor (16)</button>
        <button onclick="switchFloor('1st Floor')" id="btn-fl-1" class="px-5 py-2.5 text-xs font-extrabold rounded-xl transition-all bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 cursor-pointer">1st Floor (13)</button>
        <button onclick="switchFloor('2nd Floor')" id="btn-fl-2" class="px-5 py-2.5 text-xs font-extrabold rounded-xl transition-all bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 cursor-pointer">2nd Floor (4)</button>
      </div>

      <!-- SVG SPATIAL MAP CONTAINER -->
      <div class="relative w-full overflow-hidden bg-slate-50 rounded-3xl border border-slate-200/90 p-4 flex items-center justify-center min-h-[480px]">
        <svg id="spatial-svg-map" viewBox="0 0 800 540" class="w-full h-auto select-none">
          <!-- Dynamically Injected SVG Polygon Zones & Pins -->
        </svg>
      </div>

      <!-- MAP FOOTER LEGEND & STORE TILES SUMMARY -->
      <div class="flex flex-wrap items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-4 gap-3">
        <div class="flex items-center space-x-4">
          <span class="font-bold text-slate-700">Footfall Density:</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Low (&lt;50%)</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Medium (50-75%)</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> High (&gt;75%)</span>
        </div>
        <div id="floor-store-count" class="font-bold text-slate-700">
          Showing 16 flagships on Ground Floor
        </div>
      </div>

    </div>

    <!-- LOWER SECTION: FULL WIDTH STORE TILES GRID -->
    <div class="w-full card-light rounded-3xl p-6 lg:p-8 space-y-4 bg-white border border-slate-200">
      <div class="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 class="text-base font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <span>🏪 Flagship Stores on Selected Floor</span>
        </h3>
        <span class="text-xs text-slate-500 font-medium">Click any card to view store catalog & live POS metrics</span>
      </div>

      <div id="store-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <!-- Dynamically Injected Store Cards -->
      </div>
    </div>

  </main>

  <!-- STORE DETAIL MODAL -->
  <div id="store-modal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 relative animate-in fade-in zoom-in duration-150 text-slate-900">
      <button onclick="closeModal('store-modal')" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-lg font-bold">✕</button>
      <div id="store-modal-content"></div>
    </div>
  </div>

  <!-- CONNECTED USERS MODAL -->
  <div id="users-modal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 relative animate-in fade-in zoom-in duration-150 text-slate-900">
      <button onclick="closeModal('users-modal')" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-lg font-bold">✕</button>
      <h3 class="text-lg font-black text-slate-900">📶 Connected Wi-Fi Guest Sessions</h3>
      <div id="users-modal-content" class="max-h-96 overflow-y-auto space-y-3"></div>
    </div>
  </div>

  <!-- ORDERS & POS MODAL -->
  <div id="orders-modal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 relative animate-in fade-in zoom-in duration-150 text-slate-900">
      <button onclick="closeModal('orders-modal')" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-lg font-bold">✕</button>
      <h3 class="text-lg font-black text-slate-900">🛍️ Live Concierge & POS Orders</h3>
      <div id="orders-modal-content" class="max-h-96 overflow-y-auto space-y-3"></div>
    </div>
  </div>

  <script>
    let currentFloor = 'Ground Floor';
    let storesData = [];
    let connectedUsersData = [];
    let ordersData = [];
    let baseFootfall = 4965;

    function closeModal(id) {
      document.getElementById(id).classList.add('hidden');
    }

    function openUsersModal() {
      const modal = document.getElementById('users-modal');
      const content = document.getElementById('users-modal-content');
      modal.classList.remove('hidden');
      
      if (!connectedUsersData.length) {
        content.innerHTML = '<p class="text-xs text-slate-500">No active Wi-Fi sessions found.</p>';
        return;
      }

      content.innerHTML = connectedUsersData.map(function(u) {
        return '<div class="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">' +
          '<div class="flex items-center space-x-3">' +
            '<div class="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">' +
              ((u.name || 'G')[0].toUpperCase()) +
            '</div>' +
            '<div>' +
              '<div class="font-extrabold text-slate-900 text-sm flex items-center gap-2">' +
                (u.name || 'Guest') +
                ' <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ' + (u.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600') + '">' + u.status + '</span>' +
              '</div>' +
              '<div class="text-xs text-slate-500 font-mono">' + (u.phone || '') + ' • ' + (u.ipAddress || '192.168.10.x') + ' • ' + (u.deviceType || 'Mobile') + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="text-right text-xs">' +
            '<div class="font-bold text-slate-800">' + (u.zone || 'Central Atrium') + '</div>' +
            '<div class="text-[10px] text-slate-400">' + (u.connectionTime || 'Just now') + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function openOrdersModal() {
      const modal = document.getElementById('orders-modal');
      const content = document.getElementById('orders-modal-content');
      modal.classList.remove('hidden');

      if (!ordersData.length) {
        content.innerHTML = '<p class="text-xs text-slate-500">No orders recorded yet.</p>';
        return;
      }

      content.innerHTML = ordersData.map(function(o) {
        return '<div class="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">' +
          '<div>' +
            '<div class="font-extrabold text-slate-900 text-sm">' + (o.orderNumber || '#AX-LIVE') + ' — ' + o.storeName + '</div>' +
            '<div class="text-xs text-slate-500">' + (o.customerName || 'Shopper') + ' • ' + (o.customerPhone || '') + '</div>' +
          '</div>' +
          '<div class="text-right">' +
            '<div class="font-black text-emerald-600 text-base">₹' + Number(o.totalAmount || 0).toLocaleString() + '</div>' +
            '<div class="text-[10px] font-bold text-blue-600">' + (o.status || 'Completed') + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function renderBrandLogoHTML(storeName, extraClasses) {
      if (!extraClasses) extraClasses = 'w-10 h-10';
      const s = (storeName || '').toLowerCase();
      
      // Fashion & Apparel
      if (s.includes('nike')) {
        return '<div class="' + extraClasses + ' bg-slate-950 text-white rounded-2xl flex flex-col items-center justify-center border border-slate-800 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="font-sans font-black italic text-xs tracking-tighter transform -skew-x-12 uppercase text-white group-hover:translate-x-1 transition-all duration-300">NIKE</span>' +
          '<span class="w-4 h-0.5 bg-rose-600 rounded-full mt-0.5 transform -skew-x-12 opacity-80"></span>' +
        '</div>';
      }
      if (s.includes('zara')) {
        return '<div class="' + extraClasses + ' bg-stone-950 text-stone-100 rounded-2xl flex items-center justify-center border border-stone-800 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="font-serif font-light text-[11px] tracking-[0.25em] text-stone-100 uppercase">ZARA</span>' +
        '</div>';
      }
      if (s.includes('gucci')) {
        return '<div class="' + extraClasses + ' bg-gradient-to-b from-stone-950 via-neutral-900 to-black text-amber-200 rounded-2xl flex flex-col items-center justify-center border border-amber-900/40 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="font-serif font-extrabold text-[10px] tracking-[0.22em] text-amber-200 uppercase">GUCCI</span>' +
          '<span class="text-[6px] tracking-widest text-amber-400/60 uppercase font-sans">FLORENCE</span>' +
        '</div>';
      }
      if (s.includes('prada')) {
        return '<div class="' + extraClasses + ' bg-black text-white rounded-2xl flex flex-col items-center justify-center border border-neutral-800 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="font-sans font-black text-[10px] tracking-[0.2em] text-white uppercase">PRADA</span>' +
          '<span class="text-[6px] tracking-wider text-slate-400 font-mono">MILANO</span>' +
        '</div>';
      }
      if (s.includes('polo')) {
        return '<div class="' + extraClasses + ' bg-slate-900 text-white rounded-2xl flex flex-col items-center justify-center border border-slate-700 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="text-[10px]">🏇</span>' +
          '<span class="font-serif font-extrabold text-[7px] tracking-widest text-white uppercase">U.S. POLO</span>' +
        '</div>';
      }
      if (s.includes('h&m') || s.includes('hm flagship')) {
        return '<div class="' + extraClasses + ' bg-rose-700 text-white rounded-2xl flex items-center justify-center border border-rose-800 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="font-sans font-black text-xs tracking-tight text-white uppercase italic">H&M</span>' +
        '</div>';
      }

      // Bags & Leather
      if (s.includes('vuitton') || s.includes('lv')) {
        return '<div class="' + extraClasses + ' bg-gradient-to-br from-amber-950 via-stone-900 to-neutral-950 text-amber-300 rounded-2xl flex flex-col items-center justify-center border border-amber-800/40 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="font-serif font-black text-xs tracking-widest text-amber-300">LV</span>' +
          '<span class="text-[6px] font-sans font-semibold text-amber-400/70 tracking-wider">PARIS</span>' +
        '</div>';
      }
      if (s.includes('hermes') || s.includes('hermès')) {
        return '<div class="' + extraClasses + ' bg-orange-700 text-white rounded-2xl flex flex-col items-center justify-center border border-orange-800 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="font-serif font-black text-xs tracking-widest text-white">H</span>' +
          '<span class="text-[6px] font-sans text-orange-200 tracking-wider">PARIS</span>' +
        '</div>';
      }
      if (s.includes('coach')) {
        return '<div class="' + extraClasses + ' bg-stone-900 text-amber-200 rounded-2xl flex flex-col items-center justify-center border border-stone-800 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="font-serif font-extrabold text-[9px] tracking-wider text-amber-200 uppercase">COACH</span>' +
          '<span class="text-[6px] tracking-widest text-stone-400 uppercase font-sans">NEW YORK</span>' +
        '</div>';
      }
      if (s.includes('bottega')) {
        return '<div class="' + extraClasses + ' bg-emerald-950 text-emerald-200 rounded-2xl flex flex-col items-center justify-center border border-emerald-900 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="font-serif font-bold text-[8px] tracking-widest text-emerald-200 uppercase">BOTTEGA</span>' +
          '<span class="text-[6px] tracking-wider text-emerald-400 uppercase font-mono">VENETA</span>' +
        '</div>';
      }

      // Jewelry & Luxury
      if (s.includes('tiffany')) {
        return '<div class="' + extraClasses + ' bg-teal-600 text-white rounded-2xl flex flex-col items-center justify-center border border-teal-700 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="font-serif font-bold text-[8px] tracking-wider text-white uppercase text-center leading-tight">TIFFANY</span>' +
        '</div>';
      }
      if (s.includes('cartier')) {
        return '<div class="' + extraClasses + ' bg-red-950 text-amber-200 rounded-2xl flex flex-col items-center justify-center border border-red-800 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="font-serif italic font-bold text-xs tracking-wide text-amber-200">Cartier</span>' +
        '</div>';
      }
      if (s.includes('bvlgari')) {
        return '<div class="' + extraClasses + ' bg-neutral-950 text-amber-300 rounded-2xl flex flex-col items-center justify-center border border-amber-900/50 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="font-serif font-extrabold text-[8px] tracking-[0.2em] text-amber-300 uppercase">BVLGARI</span>' +
          '<span class="text-[6px] tracking-widest text-stone-400 uppercase">ROMA</span>' +
        '</div>';
      }
      if (s.includes('swarovski')) {
        return '<div class="' + extraClasses + ' bg-pink-950 text-pink-200 rounded-2xl flex flex-col items-center justify-center border border-pink-800 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="text-[10px]">🦢</span>' +
          '<span class="font-serif font-bold text-[7px] tracking-widest text-pink-200 uppercase">SWAROVSKI</span>' +
        '</div>';
      }
      if (s.includes('tanishq')) {
        return '<div class="' + extraClasses + ' bg-red-950 text-amber-300 rounded-2xl flex flex-col items-center justify-center border border-amber-600/40 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="text-[10px]">👑</span>' +
          '<span class="font-serif font-bold text-[8px] tracking-wider text-amber-300 uppercase">TANISHQ</span>' +
        '</div>';
      }
      if (s.includes('malabar')) {
        return '<div class="' + extraClasses + ' bg-amber-950 text-amber-300 rounded-2xl flex flex-col items-center justify-center border border-amber-700/50 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="text-[10px]">💎</span>' +
          '<span class="font-serif font-extrabold text-[8px] tracking-widest text-amber-300 uppercase">MALABAR</span>' +
        '</div>';
      }

      // Eyewear
      if (s.includes('ray-ban') || s.includes('rayban')) {
        return '<div class="' + extraClasses + ' bg-red-700 text-white rounded-2xl flex flex-col items-center justify-center border border-red-800 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="font-sans font-black italic text-[9px] tracking-tight transform -rotate-6 uppercase">RAY-BAN</span>' +
        '</div>';
      }
      if (s.includes('sunglass hut')) {
        return '<div class="' + extraClasses + ' bg-neutral-900 text-white rounded-2xl flex flex-col items-center justify-center border border-neutral-700 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="text-[10px]">🕶️</span>' +
          '<span class="font-sans font-bold text-[7px] tracking-wider text-white uppercase">SUNGLASS HUT</span>' +
        '</div>';
      }
      if (s.includes('oakley')) {
        return '<div class="' + extraClasses + ' bg-black text-white rounded-2xl flex flex-col items-center justify-center border border-red-600/50 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="text-[10px] text-red-500 font-black">O</span>' +
          '<span class="font-sans font-black text-[7px] tracking-widest text-white uppercase">OAKLEY</span>' +
        '</div>';
      }
      if (s.includes('tom ford')) {
        return '<div class="' + extraClasses + ' bg-stone-950 text-stone-200 rounded-2xl flex flex-col items-center justify-center border border-stone-800 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="font-serif font-bold text-[8px] tracking-widest text-stone-200 uppercase">TOM FORD</span>' +
          '<span class="text-[6px] tracking-wider text-stone-400 font-mono">EYEWEAR</span>' +
        '</div>';
      }
      if (s.includes('lenskart')) {
        return '<div class="' + extraClasses + ' bg-slate-900 text-cyan-400 rounded-2xl flex flex-col items-center justify-center border border-cyan-800 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="text-[10px]">👓</span>' +
          '<span class="font-sans font-black text-[7px] tracking-wider text-cyan-400 uppercase">LENSKART</span>' +
        '</div>';
      }

      // Watches & Gadgets
      if (s.includes('rolex')) {
        return '<div class="' + extraClasses + ' bg-emerald-950 text-amber-300 rounded-2xl flex flex-col items-center justify-center border border-amber-500/40 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="text-[10px] leading-none">👑</span>' +
          '<span class="font-serif font-black text-[8px] tracking-widest text-amber-300 uppercase">ROLEX</span>' +
        '</div>';
      }
      if (s.includes('omega')) {
        return '<div class="' + extraClasses + ' bg-red-950 text-white rounded-2xl flex flex-col items-center justify-center border border-red-800 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="font-serif font-black text-[11px] text-amber-300">Ω</span>' +
          '<span class="font-serif font-extrabold text-[7px] tracking-widest text-white uppercase">OMEGA</span>' +
        '</div>';
      }
      if (s.includes('tag heuer')) {
        return '<div class="' + extraClasses + ' bg-emerald-950 text-emerald-100 rounded-2xl flex flex-col items-center justify-center border border-emerald-700 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="text-[9px]">⏱️</span>' +
          '<span class="font-sans font-black text-[7px] tracking-widest text-white uppercase">TAG HEUER</span>' +
        '</div>';
      }
      if (s.includes('apple')) {
        return '<div class="' + extraClasses + ' bg-slate-900 text-white rounded-2xl flex items-center justify-center border border-slate-800 shadow-xs overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="font-sans font-extrabold text-[10px] tracking-[0.22em] text-white uppercase">APPLE</span>' +
        '</div>';
      }
      if (s.includes('tissot')) {
        return '<div class="' + extraClasses + ' bg-slate-900 text-white rounded-2xl flex flex-col items-center justify-center border border-red-600/40 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="text-[8px] text-red-500 font-bold">🇨🇭</span>' +
          '<span class="font-sans font-black text-[7px] tracking-wider text-white uppercase">TISSOT 1853</span>' +
        '</div>';
      }
      if (s.includes('titan') || s.includes('nebula')) {
        return '<div class="' + extraClasses + ' bg-stone-950 text-amber-300 rounded-2xl flex flex-col items-center justify-center border border-amber-600/40 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="text-[9px]">👑</span>' +
          '<span class="font-serif font-black text-[7px] tracking-widest text-amber-300 uppercase">NEBULA GOLD</span>' +
        '</div>';
      }

      // Food & Dining
      if (s.includes('starbucks')) {
        return '<div class="' + extraClasses + ' bg-emerald-950 text-emerald-100 rounded-2xl flex flex-col items-center justify-center border border-emerald-800 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="text-amber-400 text-[10px]">★</span>' +
          '<span class="font-serif font-bold text-[7px] tracking-widest text-amber-200 uppercase">RESERVE</span>' +
        '</div>';
      }
      if (s.includes('haagen') || s.includes('häagen')) {
        return '<div class="' + extraClasses + ' bg-rose-900 text-amber-200 rounded-2xl flex flex-col items-center justify-center border border-amber-600/40 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="text-[10px]">🍨</span>' +
          '<span class="font-serif font-bold text-[7px] tracking-wider text-amber-200 uppercase">HÄAGEN-DAZS</span>' +
        '</div>';
      }
      if (s.includes('din tai fung') || s.includes('dintaifung')) {
        return '<div class="' + extraClasses + ' bg-rose-950 text-amber-200 rounded-2xl flex flex-col items-center justify-center border border-amber-900/50 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="font-serif font-bold text-[8px] tracking-wider text-amber-200 uppercase">DIN TAI FUNG</span>' +
        '</div>';
      }
      if (s.includes('pizzaexpress') || s.includes('pizza express')) {
        return '<div class="' + extraClasses + ' bg-red-900 text-white rounded-2xl flex flex-col items-center justify-center border border-red-800 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="text-[10px]">🍕</span>' +
          '<span class="font-sans font-extrabold text-[7px] tracking-wider text-white uppercase">PIZZAEXPRESS</span>' +
        '</div>';
      }
      if (s.includes('coffee drama') || s.includes('coffee day')) {
        return '<div class="' + extraClasses + ' bg-amber-950 text-amber-200 rounded-2xl flex flex-col items-center justify-center border border-amber-800 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="text-[10px]">☕</span>' +
          '<span class="font-serif font-bold text-[7px] tracking-wider text-amber-200 uppercase">COFFEE DRAMA</span>' +
        '</div>';
      }
      if (s.includes('subway')) {
        return '<div class="' + extraClasses + ' bg-emerald-800 text-amber-300 rounded-2xl flex flex-col items-center justify-center border border-emerald-700 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
          '<span class="text-[10px]">🥪</span>' +
          '<span class="font-sans font-black text-[8px] tracking-wider text-amber-300 uppercase italic">SUBWAY</span>' +
        '</div>';
      }

      const initials = storeName ? storeName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'GM';
      return '<div class="' + extraClasses + ' bg-gradient-to-b from-blue-600 to-indigo-700 text-white rounded-2xl flex flex-col items-center justify-center border border-blue-500/30 shadow-md overflow-hidden relative group shrink-0 transition-transform duration-200 select-none">' +
        '<span class="font-serif font-extrabold text-xs tracking-wider text-white">' + initials + '</span>' +
      '</div>';
    }

    function openStoresModal() {
      switchFloor('All Stores');
    }

    function getStoreCustomerTransactions(store) {
      var txns = [];
      var sName = (store.name || '').toLowerCase();

      if (Array.isArray(ordersData)) {
        ordersData.forEach(function(o) {
          var oStore = (o.storeName || o.store_name || '').toLowerCase();
          if (oStore.includes(sName) || sName.includes(oStore) || (sName.split(' ')[0] && oStore.includes(sName.split(' ')[0]))) {
            txns.push({
              customerName: o.customerName || 'Mall Guest',
              customerPhone: o.customerPhone || '+91 98000 00000',
              orderNumber: o.orderNumber || '#AX-' + Math.floor(1000 + Math.random()*9000),
              items: Array.isArray(o.itemsList) ? o.itemsList.join(', ') : (o.itemsCount ? o.itemsCount + ' Items' : 'Store Purchase'),
              amount: Number(o.totalAmount || o.revenueToday || 15000),
              paymentMethod: o.paymentMethod || 'UPI / GPay',
              orderType: o.orderType || 'Store Pickup',
              timestamp: o.timestamp || 'Today',
              status: o.status || 'Completed',
              vipStatus: 'VIP Platinum',
              couponApplied: null
            });
          }
        });
      }

      var storeCustomerPool = [
        { name: 'Priya Sharma', phone: '+91 98345 67890', vip: 'VIP Platinum', method: 'Credit Card', type: 'VIP Fitting Suite' },
        { name: 'yoshi', phone: '+91 84950 93170', vip: 'VIP Platinum', method: 'UPI / GPay', type: 'Store Pickup' },
        { name: 'Aastha Sharma', phone: '+91 98123 98765', vip: 'VIP Gold', method: 'Apple Pay', type: 'Click & Collect' },
        { name: 'Reynold Ricky', phone: '+91 98987 65432', vip: 'VIP Platinum', method: 'Credit Card', type: 'In-Store POS' },
        { name: 'Mahima Roy', phone: '+91 98123 45678', vip: 'VIP Silver', method: 'UPI / GPay', type: 'Store Pickup' },
        { name: 'Fabrizio Rossi', phone: '+91 98666 77889', vip: 'VIP Gold', method: 'Credit Card', type: 'Click & Collect' },
        { name: 'Ananya Sharma', phone: '+91 98555 66778', vip: 'VIP Silver', method: 'Cash / POS', type: 'In-Store POS' },
        { name: 'Natasha Fernandez', phone: '+91 98999 11122', vip: 'VIP Silver', method: 'UPI / GPay', type: 'Store Pickup' },
        { name: 'Pudina Kumar', phone: '+91 98754 36789', vip: 'VIP Gold', method: 'Credit Card', type: 'VIP Concierge' },
        { name: 'Claire Montrose', phone: '+91 98111 22334', vip: 'VIP Platinum', method: 'Apple Pay', type: 'In-Store POS' }
      ];

      var totalRev = Number(store.revenueToday) || 120000;
      var ordersCount = Math.max(Number(store.ordersCount) || 5, 4);
      var sampleItems = store.items || [];

      if (txns.length < 4) {
        var times = ['10:15 AM', '11:42 AM', '01:20 PM', '03:10 PM', '04:45 PM', '05:30 PM'];
        var countToGen = Math.min(Math.max(ordersCount, 4), 6);
        var remaining = totalRev;
        for (var i = 0; i < countToGen; i++) {
          var cust = storeCustomerPool[(i + (store.name ? store.name.length : 0)) % storeCustomerPool.length];
          var isLast = (i === countToGen - 1);
          var amt = isLast ? Math.max(remaining, 1200) : Math.round((totalRev / countToGen) * (0.65 + (i * 0.15)));
          remaining -= amt;
          if (amt <= 0) amt = Math.round(totalRev / countToGen);

          var itemDesc = 'Store Catalog Item';
          if (sampleItems.length > 0) {
            var itemObj = sampleItems[i % sampleItems.length];
            itemDesc = itemObj.name + ' (x1)';
          }

          var couponText = null;
          if (i % 2 === 0) {
            couponText = store.name.split(' ')[0].toUpperCase() + 'PROMO (₹' + (Math.round(amt * 0.1 / 100) * 100).toLocaleString() + ' Saved)';
          }

          txns.push({
            customerName: cust.name,
            customerPhone: cust.phone,
            orderNumber: '#AX-' + (1080 + i),
            items: itemDesc,
            amount: amt,
            paymentMethod: cust.method,
            orderType: cust.type,
            timestamp: times[i % times.length],
            status: 'Completed',
            vipStatus: cust.vip,
            couponApplied: couponText
          });
        }
      }

      return txns;
    }

    function openStoreModal(storeId) {
      const store = storesData.find(s => s.id === storeId);
      if (!store) return;
      const modal = document.getElementById('store-modal');
      const content = document.getElementById('store-modal-content');
      modal.classList.remove('hidden');

      const txns = getStoreCustomerTransactions(store);
      const totalRev = Number(store.revenueToday) || 0;
      const totalOrders = Math.max(Number(store.ordersCount) || 1, txns.length);
      const avgOrderVal = Math.round(totalRev / totalOrders);

      let txnsHtml = txns.map(function(t) {
        return '<div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">' +
          '<div class="space-y-1">' +
            '<div class="flex items-center space-x-2">' +
              '<span class="font-black text-slate-900 text-sm">' + t.customerName + '</span>' +
              '<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">' + t.vipStatus + '</span>' +
              '<span class="text-[10px] font-mono text-slate-400">' + t.orderNumber + '</span>' +
            '</div>' +
            '<div class="text-slate-600 font-medium text-[11px] flex flex-wrap items-center gap-2">' +
              '<span>📞 ' + t.customerPhone + '</span>' +
              '<span>•</span>' +
              '<span>🛍️ ' + t.items + '</span>' +
            '</div>' +
            (t.couponApplied ? '<div class="text-[10px] text-emerald-700 font-bold">🎟️ Coupon: ' + t.couponApplied + '</div>' : '') +
          '</div>' +
          '<div class="text-right flex sm:flex-col justify-between sm:justify-center items-end border-t sm:border-t-0 border-slate-200/60 pt-2 sm:pt-0">' +
            '<div class="text-sm font-black text-emerald-700">₹' + Number(t.amount).toLocaleString() + '</div>' +
            '<div class="text-[10px] text-slate-500 font-semibold">' + t.paymentMethod + ' • ' + t.timestamp + '</div>' +
          '</div>' +
        '</div>';
      }).join('');

      content.innerHTML = 
        '<div class="flex items-center justify-between border-b border-slate-100 pb-4">' +
          '<div class="flex items-center space-x-3">' +
            renderBrandLogoHTML(store.name, 'w-12 h-12') +
            '<div>' +
              '<h3 class="text-xl font-black text-slate-900">' + store.name + '</h3>' +
              '<span class="text-xs font-bold text-slate-500">' + store.category + ' • ' + store.zone + ' • ' + store.floor + '</span>' +
            '</div>' +
          '</div>' +
          '<span class="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">Open</span>' +
        '</div>' +

        '<div class="grid grid-cols-4 gap-2 text-center my-4">' +
          '<div class="p-2.5 bg-slate-50 rounded-2xl border border-slate-200">' +
            '<div class="text-[10px] font-bold text-slate-400 uppercase">Visitors</div>' +
            '<div class="text-sm font-black text-slate-900">' + (store.visitorsToday || 0) + '</div>' +
          '</div>' +
          '<div class="p-2.5 bg-slate-50 rounded-2xl border border-slate-200">' +
            '<div class="text-[10px] font-bold text-slate-400 uppercase">Orders</div>' +
            '<div class="text-sm font-black text-slate-900">' + totalOrders + '</div>' +
          '</div>' +
          '<div class="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200">' +
            '<div class="text-[10px] font-bold text-emerald-700 uppercase">Revenue</div>' +
            '<div class="text-sm font-black text-emerald-700">₹' + totalRev.toLocaleString() + '</div>' +
          '</div>' +
          '<div class="p-2.5 bg-blue-50 rounded-2xl border border-blue-200">' +
            '<div class="text-[10px] font-bold text-blue-700 uppercase">Avg Order</div>' +
            '<div class="text-sm font-black text-blue-700">₹' + avgOrderVal.toLocaleString() + '</div>' +
          '</div>' +
        '</div>' +

        '<div class="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-xl border border-slate-200/80 my-3">' +
          '<div><span class="text-slate-500 font-medium">Manager:</span> <strong class="text-slate-900">' + (store.manager || 'Store Manager') + '</strong> (' + (store.phone || '+91 80 4930 1000') + ')</div>' +
          '<div><span class="text-slate-500 font-medium">Rating:</span> <strong class="text-amber-600">★ ' + (store.rating || '4.9') + '</strong></div>' +
        '</div>' +

        '<div class="border-t border-slate-200 pt-4 space-y-3">' +
          '<div class="flex items-center justify-between">' +
            '<h4 class="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">' +
              '<span>💰 Store Revenue & Customer Transactions Breakdown</span>' +
            '</h4>' +
            '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">Live POS & Customer Feed</span>' +
          '</div>' +
          '<div class="max-h-64 overflow-y-auto space-y-2 custom-scrollbar pr-1">' +
            txnsHtml +
          '</div>' +
        '</div>';
    }

    let showHeatmapOverlay = true;

    function toggleHeatmapOverlay() {
      showHeatmapOverlay = !showHeatmapOverlay;
      const btn = document.getElementById('btn-heatmap-toggle');
      if (btn) {
        btn.className = showHeatmapOverlay
          ? 'px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-md shadow-rose-600/20 flex items-center space-x-2 cursor-pointer transition-all'
          : 'px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center space-x-2 cursor-pointer transition-all';
        btn.innerHTML = showHeatmapOverlay ? '<span>🔥 Heatmap Overlay</span>' : '<span>❄️ Standard Layout</span>';
      }
      renderSpatialSvgMap();
    }

    function resetMapView() {
      showHeatmapOverlay = true;
      switchFloor('Ground Floor');
    }

    function handleZoneClick(el) {
      const id = el.getAttribute('data-store-id');
      if (id) openStoreModal(id);
    }

    function renderSpatialSvgMap() {
      const svg = document.getElementById('spatial-svg-map');
      if (!svg) return;

      let html = '<defs>' +
        '<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">' +
          '<path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="1" />' +
        '</pattern>' +
        '<radialGradient id="atriumGlow" cx="50%" cy="50%" r="50%">' +
          '<stop offset="0%" stop-color="#3b82f6" stop-opacity="0.25" />' +
          '<stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />' +
        '</radialGradient>' +
      '</defs>' +
      '<rect width="800" height="540" fill="url(#grid)" />' +
      '<rect x="40" y="40" width="720" height="460" rx="32" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="2" stroke-dasharray="6 6" />';

      if (currentFloor === 'Ground Floor') {
        html += 
          '<g cursor="pointer" data-store-id="brand-3" onclick="handleZoneClick(this)">' +
            '<path d="M 240 60 L 560 60 L 510 170 L 290 170 Z" fill="' + (showHeatmapOverlay ? '#fee2e2' : '#f1f5f9') + '" stroke="#ef4444" stroke-width="2" opacity="0.95" />' +
            '<text x="400" y="105" fill="#0f172a" font-size="13" font-weight="900" text-anchor="middle">Luxury Promenade (North)</text>' +
            '<text x="400" y="125" fill="#dc2626" font-size="10" font-weight="700" text-anchor="middle">⚡ 480 visitors (High)</text>' +
            '<g transform="translate(460, 95)">' +
              '<rect x="-35" y="-12" width="70" height="18" rx="9" fill="#0f172a" stroke="#ef4444" stroke-width="1.5" />' +
              '<text x="0" y="1" fill="#10b981" font-size="9" font-weight="900" text-anchor="middle">₹41.2L Today</text>' +
              '<circle cx="-16" cy="18" r="12" fill="#0f172a" stroke="#3b82f6" stroke-width="2" />' +
              '<text x="-16" y="22" fill="#ffffff" font-size="8" font-weight="900" text-anchor="middle">GC</text>' +
            '</g>' +
          '</g>' +

          '<g cursor="pointer" data-store-id="brand-7" onclick="handleZoneClick(this)">' +
            '<path d="M 320 190 L 480 190 L 540 310 L 480 430 L 320 430 L 260 310 Z" fill="' + (showHeatmapOverlay ? '#e0f2fe' : '#f8fafc') + '" stroke="#3b82f6" stroke-width="2.5" opacity="0.95" />' +
            '<circle cx="400" cy="310" r="85" fill="url(#atriumGlow)" class="animate-pulse" />' +
            '<text x="400" y="295" fill="#0f172a" font-size="14" font-weight="900" text-anchor="middle">Central Grand Atrium</text>' +
            '<text x="400" y="315" fill="#2563eb" font-size="10" font-weight="700" text-anchor="middle">⚡ 820 visitors (Peak)</text>' +
            '<g transform="translate(400, 265)">' +
              '<rect x="-35" y="-10" width="70" height="18" rx="9" fill="#0f172a" stroke="#10b981" stroke-width="1.5" />' +
              '<text x="0" y="3" fill="#10b981" font-size="9" font-weight="900" text-anchor="middle">₹58.5L Today</text>' +
            '</g>' +
            '<g transform="translate(350, 365)">' +
              '<circle cx="0" cy="0" r="14" fill="#0f172a" stroke="#f59e0b" stroke-width="2" />' +
              '<text x="0" y="4" fill="#ffffff" font-size="9" font-weight="900" text-anchor="middle">RLX</text>' +
              '<rect x="-25" y="16" width="50" height="14" rx="7" fill="#10b981" />' +
              '<text x="0" y="26" fill="#ffffff" font-size="8" font-weight="900" text-anchor="middle">₹18.5L</text>' +
            '</g>' +
            '<g transform="translate(450, 365)">' +
              '<circle cx="0" cy="0" r="14" fill="#0f172a" stroke="#3b82f6" stroke-width="2" />' +
              '<text x="0" y="4" fill="#ffffff" font-size="9" font-weight="900" text-anchor="middle">LV</text>' +
              '<rect x="-25" y="16" width="50" height="14" rx="7" fill="#10b981" />' +
              '<text x="0" y="26" fill="#ffffff" font-size="8" font-weight="900" text-anchor="middle">₹14.0L</text>' +
            '</g>' +
          '</g>' +

          '<g cursor="pointer" data-store-id="brand-11" onclick="handleZoneClick(this)">' +
            '<path d="M 560 200 L 740 200 L 740 420 L 560 420 Z" fill="' + (showHeatmapOverlay ? '#fef3c7' : '#f1f5f9') + '" stroke="#f59e0b" stroke-width="2" opacity="0.95" />' +
            '<text x="650" y="295" fill="#0f172a" font-size="13" font-weight="900" text-anchor="middle">High Jewelry Salon (East)</text>' +
            '<text x="650" y="315" fill="#d97706" font-size="10" font-weight="700" text-anchor="middle">⚡ 340 visitors (Medium)</text>' +
            '<g transform="translate(650, 265)">' +
              '<rect x="-35" y="-10" width="70" height="18" rx="9" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5" />' +
              '<text x="0" y="3" fill="#10b981" font-size="9" font-weight="900" text-anchor="middle">₹32.5L Today</text>' +
            '</g>' +
          '</g>' +

          '<g cursor="pointer" data-store-id="brand-1" onclick="handleZoneClick(this)">' +
            '<path d="M 60 200 L 240 200 L 240 420 L 60 420 Z" fill="' + (showHeatmapOverlay ? '#f3e8ff' : '#f1f5f9') + '" stroke="#a855f7" stroke-width="2" opacity="0.95" />' +
            '<text x="150" y="295" fill="#0f172a" font-size="13" font-weight="900" text-anchor="middle">Artisan Cafe Court (West)</text>' +
            '<text x="150" y="315" fill="#7e22ce" font-size="10" font-weight="700" text-anchor="middle">⚡ 410 visitors (High)</text>' +
          '</g>' +

          '<g cursor="pointer" data-store-id="brand-18" onclick="handleZoneClick(this)">' +
            '<path d="M 280 445 L 520 445 L 570 515 L 230 515 Z" fill="' + (showHeatmapOverlay ? '#d1fae5' : '#f1f5f9') + '" stroke="#10b981" stroke-width="2" opacity="0.95" />' +
            '<text x="400" y="475" fill="#0f172a" font-size="13" font-weight="900" text-anchor="middle">Tech & Experience Court (South)</text>' +
            '<text x="400" y="495" fill="#047857" font-size="10" font-weight="700" text-anchor="middle">⚡ 390 visitors (Active)</text>' +
          '</g>';
      } else if (currentFloor === '1st Floor') {
        html += 
          '<g cursor="pointer" data-store-id="brand-1" onclick="handleZoneClick(this)">' +
            '<path d="M 240 70 L 560 70 L 510 240 L 290 240 Z" fill="' + (showHeatmapOverlay ? '#fce7f3' : '#f1f5f9') + '" stroke="#ec4899" stroke-width="2.5" opacity="0.95" />' +
            '<text x="400" y="140" fill="#0f172a" font-size="14" font-weight="900" text-anchor="middle">Fashion Runway & Apparel (North)</text>' +
            '<text x="400" y="160" fill="#be185d" font-size="10" font-weight="700" text-anchor="middle">⚡ 610 visitors (High)</text>' +
            '<g transform="translate(400, 100)">' +
              '<rect x="-35" y="-10" width="70" height="18" rx="9" fill="#0f172a" stroke="#ec4899" stroke-width="1.5" />' +
              '<text x="0" y="3" fill="#10b981" font-size="9" font-weight="900" text-anchor="middle">₹24.8L Today</text>' +
              '<circle cx="0" cy="22" r="14" fill="#0f172a" stroke="#ec4899" stroke-width="2" />' +
              '<text x="0" y="26" fill="#ffffff" font-size="9" font-weight="900" text-anchor="middle">NK</text>' +
            '</g>' +
          '</g>' +

          '<g cursor="pointer" data-store-id="brand-13" onclick="handleZoneClick(this)">' +
            '<path d="M 290 340 L 510 340 L 560 510 L 240 510 Z" fill="' + (showHeatmapOverlay ? '#e0f2fe' : '#f1f5f9') + '" stroke="#3b82f6" stroke-width="2.5" opacity="0.95" />' +
            '<text x="400" y="420" fill="#0f172a" font-size="14" font-weight="900" text-anchor="middle">Eyewear & Horology Gallery (South)</text>' +
            '<text x="400" y="440" fill="#1d4ed8" font-size="10" font-weight="700" text-anchor="middle">⚡ 380 visitors (Medium)</text>' +
            '<g transform="translate(400, 380)">' +
              '<rect x="-35" y="-10" width="70" height="18" rx="9" fill="#0f172a" stroke="#3b82f6" stroke-width="1.5" />' +
              '<text x="0" y="3" fill="#10b981" font-size="9" font-weight="900" text-anchor="middle">₹11.2L Today</text>' +
              '<circle cx="0" cy="22" r="14" fill="#0f172a" stroke="#3b82f6" stroke-width="2" />' +
              '<text x="0" y="26" fill="#ffffff" font-size="9" font-weight="900" text-anchor="middle">TAG</text>' +
            '</g>' +
          '</g>' +

          '<g transform="translate(240, 290)" cursor="pointer" data-store-id="brand-6" onclick="handleZoneClick(this)">' +
            '<circle cx="0" cy="0" r="16" fill="#0f172a" stroke="#3b82f6" stroke-width="2" />' +
            '<text x="0" y="5" fill="#ffffff" font-size="10" font-weight="900" text-anchor="middle">HM</text>' +
            '<rect x="-30" y="-24" width="60" height="16" rx="8" fill="#0f172a" stroke="#10b981" stroke-width="1" />' +
            '<text x="0" y="-13" fill="#10b981" font-size="8" font-weight="900" text-anchor="middle">₹3.4L Today</text>' +
          '</g>';
      } else if (currentFloor === '2nd Floor') {
        html += 
          '<g cursor="pointer" data-store-id="brand-21" onclick="handleZoneClick(this)">' +
            '<path d="M 240 90 L 560 90 L 560 250 L 240 250 Z" fill="' + (showHeatmapOverlay ? '#fef3c7' : '#f1f5f9') + '" stroke="#f59e0b" stroke-width="2.5" opacity="0.95" />' +
            '<text x="400" y="160" fill="#0f172a" font-size="14" font-weight="900" text-anchor="middle">Gourmet Dining Terrace (North)</text>' +
            '<text x="400" y="180" fill="#b45309" font-size="10" font-weight="700" text-anchor="middle">⚡ 720 visitors (Peak Dining)</text>' +
            '<g transform="translate(400, 120)">' +
              '<rect x="-35" y="-10" width="70" height="18" rx="9" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5" />' +
              '<text x="0" y="3" fill="#10b981" font-size="9" font-weight="900" text-anchor="middle">₹18.2L Today</text>' +
            '</g>' +
          '</g>' +

          '<g cursor="pointer" data-store-id="brand-23" onclick="handleZoneClick(this)">' +
            '<path d="M 240 300 L 560 300 L 560 460 L 240 460 Z" fill="' + (showHeatmapOverlay ? '#e0f2fe' : '#f1f5f9') + '" stroke="#3b82f6" stroke-width="2.5" opacity="0.95" />' +
            '<text x="400" y="370" fill="#0f172a" font-size="14" font-weight="900" text-anchor="middle">Bistro & Quick Service Pavilion</text>' +
            '<text x="400" y="390" fill="#1d4ed8" font-size="10" font-weight="700" text-anchor="middle">⚡ 450 visitors (Medium)</text>' +
          '</g>';
      } else {
        // All Stores View
        html += 
          '<g cursor="pointer">' +
            '<path d="M 240 80 L 560 80 L 560 460 L 240 460 Z" fill="' + (showHeatmapOverlay ? '#f3e8ff' : '#f1f5f9') + '" stroke="#a855f7" stroke-width="2.5" opacity="0.95" />' +
            '<text x="400" y="240" fill="#0f172a" font-size="16" font-weight="900" text-anchor="middle">AXIONIX Mall — All 33 Stores & Zones</text>' +
            '<text x="400" y="270" fill="#6b21a8" font-size="12" font-weight="700" text-anchor="middle">⚡ 33 Active Flagships • 3 Floors Connected</text>' +
            '<text x="400" y="300" fill="#059669" font-size="11" font-weight="800" text-anchor="middle">Ground Floor: 16 | 1st Floor: 13 | 2nd Floor: 4</text>' +
          '</g>';
      }

      svg.innerHTML = html;
    }

    function switchFloor(floor) {
      currentFloor = floor;
      const buttons = [
        { id: 'btn-fl-all', target: 'All Stores' },
        { id: 'btn-fl-0', target: 'Ground Floor' },
        { id: 'btn-fl-1', target: '1st Floor' },
        { id: 'btn-fl-2', target: '2nd Floor' }
      ];

      buttons.forEach(b => {
        const btn = document.getElementById(b.id);
        if (btn) {
          const isMatch = (floor === b.target);
          btn.className = isMatch
            ? 'px-5 py-2.5 text-xs font-extrabold rounded-xl transition-all bg-blue-600 text-white shadow-md shadow-blue-600/20 cursor-pointer'
            : 'px-5 py-2.5 text-xs font-extrabold rounded-xl transition-all bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 cursor-pointer';
        }
      });
      renderStores();
      renderSpatialSvgMap();
    }

    function renderStores() {
      const container = document.getElementById('store-grid');
      const filtered = currentFloor === 'All Stores' ? storesData : storesData.filter(s => s.floor === currentFloor);
      const countEl = document.getElementById('floor-store-count');
      if (countEl) countEl.innerText = 'Showing ' + filtered.length + ' flagships on ' + currentFloor;

      if (!filtered.length) {
        container.innerHTML = '<div class="col-span-4 py-8 text-center text-xs text-slate-400 font-semibold">No stores registered on this floor yet.</div>';
        return;
      }

      container.innerHTML = filtered.map(function(store) {
        const visitors = Number(store.visitorsToday || store.visitors_today) || 0;
        const ordersNum = Number(store.ordersCount || store.orders_count) || 0;
        const revVal = Number(store.revenueToday || store.revenue_today) || 0;
        const revK = (revVal / 1000).toFixed(0);

        const SQ = "'";
        return '<div onclick="openStoreModal(' + SQ + store.id + SQ + ')" class="card-light bg-white border border-slate-200 rounded-2xl p-4 hover:border-blue-500/80 hover:shadow-md transition-all cursor-pointer group">' +
          '<div class="flex items-center justify-between mb-3">' +
            '<div class="flex items-center space-x-3">' +
              renderBrandLogoHTML(store.name, 'w-11 h-11') +
              '<div>' +
                '<h4 class="font-extrabold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">' + store.name + '</h4>' +
                '<div class="text-[11px] text-slate-500 font-medium">' + (store.category || 'General') + ' • ' + (store.zone || 'Central Atrium') + '</div>' +
              '</div>' +
            '</div>' +
            '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">' + (store.status === 'closed' ? 'Closed' : 'Open') + '</span>' +
          '</div>' +
          '<div class="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">' +
            '<div>' +
              '<div class="text-[10px] text-slate-400 uppercase font-bold">Visitors</div>' +
              '<div class="font-extrabold text-slate-900 mt-0.5">' + visitors.toLocaleString() + '</div>' +
            '</div>' +
            '<div>' +
              '<div class="text-[10px] text-slate-400 uppercase font-bold">Orders</div>' +
              '<div class="font-extrabold text-slate-900 mt-0.5">' + ordersNum.toLocaleString() + '</div>' +
            '</div>' +
            '<div>' +
              '<div class="text-[10px] text-slate-400 uppercase font-bold">Revenue</div>' +
              '<div class="font-extrabold text-emerald-600 mt-0.5">₹' + revK + 'k</div>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    async function loadData() {
      try {
        const [mRes, bRes, uRes, oRes] = await Promise.all([
          fetch('/api/admin/metrics').then(r => r.json()),
          fetch('/api/brands').then(r => r.json()),
          fetch('/api/auth/connected-users').then(r => r.json()),
          fetch('/api/orders').then(r => r.json())
        ]);

        if (bRes.success && Array.isArray(bRes.brands)) {
          storesData = bRes.brands;
          renderStores();
          renderSpatialSvgMap();
          
          let totalStoreRev = storesData.reduce((acc, s) => acc + (Number(s.revenueToday || s.revenue_today) || 0), 0);
          let totalStoreVisitors = storesData.reduce((acc, s) => acc + (Number(s.visitorsToday || s.visitors_today) || 0), 0);
          let totalStoreOrders = storesData.reduce((acc, s) => acc + (Number(s.ordersCount || s.orders_count) || 0), 0);

          document.getElementById('metric-stores').innerText = storesData.length + ' Stores';
          if (totalStoreRev > 0) {
            document.getElementById('metric-revenue').innerText = '₹' + (totalStoreRev / 10000000).toFixed(2) + ' Cr';
          }
          if (totalStoreVisitors > 0) {
            document.getElementById('metric-footfall').innerText = totalStoreVisitors.toLocaleString();
          }
          if (totalStoreOrders > 0) {
            document.getElementById('metric-orders').innerText = totalStoreOrders.toLocaleString() + ' Orders';
          }
        }

        if (mRes.success) {
          if (mRes.activeUsers !== undefined) {
            document.getElementById('metric-users').innerText = mRes.activeUsers + ' Active';
          }
        }

        if (uRes.success) {
          connectedUsersData = uRes.users || [];
        }

        if (oRes.success) {
          ordersData = oRes.orders || [];
        }
      } catch(err) {}
    }

    // Connect to SSE stream for instantaneous real-time UI updates
    try {
      const evtSource = new EventSource('/api/realtime/stream');
      evtSource.onmessage = function(e) {
        try {
          loadData();
        } catch(err) {}
      };
    } catch(err) {}

    // Poll live backend endpoints every 2.5 seconds as fallback
    setInterval(loadData, 2500);

    loadData();
  </script>
</body>
</html>`);
});

// 1. SSE Stream Endpoint
app.get('/api/realtime/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

app.post('/api/realtime/broadcast', (req, res) => {
  const { type, payload } = req.body;
  if (typeof broadcastEvent === 'function') {
    broadcastEvent(type || 'LOW_STOCK_ALERT', payload || {});
  }
  res.json({ success: true, message: 'Event broadcasted' });
});

// 2. Authentication & Wi-Fi Gateway Routes
const pendingOtps = {};

app.post('/api/auth/send-otp', (req, res) => {
  const { phone } = req.body;
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

  if (cleanPhone) pendingOtps[cleanPhone] = generatedOtp;
  if (phone) pendingOtps[phone] = generatedOtp;

  res.json({ success: true, message: `OTP sent successfully to ${phone}`, otp: generatedOtp });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, otp, name } = req.body;
  const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
  const expectedOtp = (cleanPhone && pendingOtps[cleanPhone]) || pendingOtps[phone];

  if (!otp || String(otp).trim() !== String(expectedOtp).trim()) {
    return res.status(400).json({ success: false, message: 'Invalid OTP entered. Please check the code displayed above.' });
  }

  if (cleanPhone) delete pendingOtps[cleanPhone];
  if (phone) delete pendingOtps[phone];

  const guestName = name || 'Valued Shopper';
  let existingUser = connectedUsers.find(u => {
    const uClean = (u.phone || '').replace(/\D/g, '').slice(-10);
    return (cleanPhone && uClean === cleanPhone) || 
           u.phone === phone || 
           (name && u.name && u.name.toLowerCase() === name.toLowerCase());
  });

  if (!existingUser) {
    existingUser = {
      id: 'usr-' + Date.now(),
      name: guestName,
      phone: phone || `+91 ${cleanPhone}`,
      macAddress: 'FE:88:99:A1:B2:C3',
      ipAddress: '192.168.10.' + (Math.floor(Math.random() * 150) + 100),
      connectionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sessionDuration: 'Just connected',
      visitedStores: [],
      dataUsed: '15 MB',
      status: 'Active',
      vipStatus: true,
      zone: 'Ground Floor Atrium',
      deviceType: 'iOS'
    };
    connectedUsers.unshift(existingUser);
  } else {
    existingUser.status = 'Active';
    if (name) existingUser.name = name;
  }

  broadcastEvent('GUEST_CHECKIN', existingUser);
  res.json({ success: true, token: 'jwt_axionix_secret_token_' + Date.now(), user: existingUser });
});

app.post('/api/auth/disconnect', (req, res) => {
  const { phone, userId } = req.body;
  const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
  const user = connectedUsers.find(u => {
    const uClean = (u.phone || '').replace(/\D/g, '').slice(-10);
    return u.id === userId || (cleanPhone && uClean === cleanPhone) || u.phone === phone;
  });

  if (user) {
    user.status = 'Disconnected';
    broadcastEvent('GUEST_DISCONNECT', user);
    return res.json({ success: true, message: 'User disconnected successfully', user });
  }
  res.status(404).json({ success: false, message: 'User not found' });
});

app.get('/api/auth/connected-users', (req, res) => {
  res.json({ success: true, users: connectedUsers });
});

app.post('/api/auth/visit-store', (req, res) => {
  const { phone, storeName, userName } = req.body;
  if (!storeName) return res.status(400).json({ success: false, message: 'storeName is required' });

  const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
  let user = connectedUsers.find(u => {
    const uClean = (u.phone || '').replace(/\D/g, '').slice(-10);
    return (cleanPhone && uClean === cleanPhone) || 
           (phone && u.phone === phone) || 
           (userName && u.name && u.name.toLowerCase() === userName.toLowerCase()) ||
           (phone && u.name && u.name.toLowerCase() === phone.toLowerCase());
  });

  if (user) {
    if (!Array.isArray(user.visitedStores)) user.visitedStores = [];
    if (!user.visitedStores.includes(storeName)) {
      user.visitedStores.push(storeName);
    }
    user.status = 'Active';
    if (userName && (!user.name || user.name === 'Valued Guest')) {
      user.name = userName;
    }
  } else if (cleanPhone || userName || phone) {
    user = {
      id: 'usr-' + Date.now(),
      name: userName || (cleanPhone ? `Guest ${cleanPhone.slice(-4)}` : 'Valued Guest'),
      phone: phone || (cleanPhone ? `+91 ${cleanPhone}` : '+91 94612 34567'),
      macAddress: 'FE:88:99:A1:B2:C3',
      ipAddress: '192.168.10.' + (Math.floor(Math.random() * 150) + 100),
      connectionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sessionDuration: 'Just connected',
      visitedStores: [storeName],
      dataUsed: '15 MB',
      status: 'Active',
      vipStatus: true,
      zone: 'Ground Floor Atrium',
      deviceType: 'iOS'
    };
    connectedUsers.unshift(user);
  }

  const brand = brands.find(b => b.name.toLowerCase() === storeName.toLowerCase());
  if (brand) {
    brand.visitorsToday = (brand.visitorsToday || 0) + 1;
  }

  const log = {
    id: 'act-' + Date.now(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    userName: user ? user.name : (userName || 'Shopper'),
    action: 'visited',
    detail: `Browsed ${storeName}`,
    storeName: storeName,
    badgeType: 'blue'
  };
  activityLogs.unshift(log);

  broadcastEvent('STORE_VISIT', { user, storeName, visitorsToday: brand ? brand.visitorsToday : 0 });
  res.json({ success: true, user, visitorsToday: brand ? brand.visitorsToday : 0 });
});

// 3. Brands & Store Directory Routes
app.get('/api/brands', async (req, res) => {
  try {
    const { data: supaBrands, error } = await supabase.from('brands').select('*').order('name', { ascending: true });
    const supaMap = new Map();
    if (!error && supaBrands && Array.isArray(supaBrands)) {
      supaBrands.forEach(sb => supaMap.set((sb.name || '').toLowerCase().trim(), sb));
    }

    const allMergedBrands = brands.map((mb, idx) => {
      const sb = supaMap.get((mb.name || '').toLowerCase().trim());
      const visitors = (typeof mb.visitorsToday === 'number') ? mb.visitorsToday : 250;
      const orders = (typeof mb.ordersCount === 'number') ? mb.ordersCount : 25;
      const rev = (typeof mb.revenueToday === 'number') ? mb.revenueToday : 450000;

      return {
        id: (sb && sb.id) || mb.id || `brand-${idx + 1}`,
        name: mb.name,
        category: mb.category || (sb && sb.category) || 'Fashion',
        floor: mb.floor || (sb && sb.floor) || 'Ground Floor',
        zone: mb.zone || (sb && sb.zone) || 'Central Atrium',
        status: (sb && sb.status) || mb.status || 'Open',
        rating: (sb && typeof sb.rating === 'number') ? sb.rating : (mb.rating || 4.8),
        openHours: (sb && sb.open_hours) || mb.openHours || '10:00 AM - 10:00 PM',
        manager: (sb && sb.manager) || mb.manager || 'Store Manager',
        phone: (sb && sb.phone) || mb.phone || '+91 80 4930 1000',
        logo: mb.logo || (sb && sb.logo_variant) || '🏬',
        logo_variant: (sb && sb.logo_variant) || mb.logoVariant,
        logo_url: (sb && sb.logo_url) || mb.logoUrl,
        visitorsToday: visitors,
        visitors_today: visitors,
        ordersCount: orders,
        orders_count: orders,
        revenueToday: rev,
        revenue_today: rev,
        reservationsCount: mb.reservationsCount || 5,
        conversionRate: mb.conversionRate || 22.5,
        items: mb.items || []
      };
    });

    return res.json({ success: true, brands: allMergedBrands });
  } catch (e) {
    res.json({ success: true, brands: brands });
  }
});

// 4. Coupons & Redemptions Routes
app.get('/api/coupons', (req, res) => {
  res.json({ success: true, coupons: coupons });
});

app.get('/api/auth/coupon-redemptions', (req, res) => {
  res.json({ success: true, redemptions: couponRedemptions });
});

app.post('/api/auth/apply-coupon', (req, res) => {
  const { couponCode, customerName, customerPhone, storeName, savingsAmount } = req.body;
  const cpn = coupons.find(c => c.code.toUpperCase() === (couponCode || '').toUpperCase());

  const cleanP = (customerPhone || '').replace(/\D/g, '');
  const existingRedemption = couponRedemptions.find(r =>
    (r.couponCode || '').toUpperCase() === (couponCode || '').toUpperCase() &&
    ((r.customerPhone && r.customerPhone.replace(/\D/g, '') === cleanP) || r.customerName === customerName)
  );

  if (existingRedemption) {
    return res.json({ success: true, redemption: existingRedemption, duplicate: true });
  }

  if (cpn) {
    cpn.redeemedCount += 1;
  }

  const redemption = {
    id: 'rdm-' + Date.now(),
    couponId: cpn ? cpn.id : 'cpn-custom',
    couponCode: couponCode || 'PROMO',
    customerName: customerName && customerName.trim() ? customerName : 'Reynold Ricky',
    customerPhone: customerPhone || '+91 98987 65432',
    redeemedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    storeName: storeName || (cpn ? cpn.storeName : 'Concierge Store'),
    discountApplied: cpn ? cpn.discount : 'Promo Discount',
    savingsAmount: savingsAmount ? `₹${Number(savingsAmount).toLocaleString()} Saved` : '₹1,500 Saved',
    channel: 'WiFi Captive Portal',
    orderNumber: '#AX-' + Math.floor(1000 + Math.random() * 9000),
    vipStatus: true
  };

  couponRedemptions.unshift(redemption);
  broadcastEvent('COUPON_REDEEMED', redemption);
  res.json({ success: true, redemption });
});


// 5. Orders & POS Transactions Routes
app.get('/api/orders', (req, res) => {
  res.json({ success: true, orders: orders });
});

app.post('/api/orders', (req, res) => {
  const { storeName, customerName, customerPhone, items, totalAmount, paymentMethod, appliedCoupon, stores } = req.body;

  const normalizedItems = Array.isArray(items) && items.length > 0 ? items.map(i => {
    const itemName = i.name || (i.item && i.item.name) || i.item_name || 'Designer Item';
    const itemPrice = Number(i.price !== undefined ? i.price : (i.item && i.item.price !== undefined ? i.item.price : 2495));
    const itemQty = Number(i.quantity || i.qty || 1);
    const itemStore = i.brandName || (i.item && i.item.brandName) || i.storeName || storeName || 'Grand Mall Store';
    return {
      name: itemName,
      price: itemPrice,
      quantity: itemQty,
      brandName: itemStore,
      storeName: itemStore
    };
  }) : [];

  const distinctStores = Array.isArray(stores) && stores.length > 0 
    ? stores 
    : Array.from(new Set(normalizedItems.map(i => i.storeName).filter(Boolean)));

  const finalStoreName = storeName || (distinctStores.length > 1 ? distinctStores.join(', ') : (distinctStores[0] || 'Grand Mall Concierge'));

  const newOrder = {
    id: 'ORD-' + (orders.length + 1091),
    orderNumber: req.body.orderNumber || ('#AX-' + (orders.length + 1091)),
    customerName: customerName && customerName.trim() ? customerName : 'Reynold Ricky',
    customerPhone: customerPhone || '+91 98987 65432',
    storeName: finalStoreName,
    stores: distinctStores,
    storeCategory: 'Fashion',
    itemsCount: normalizedItems.length > 0 ? normalizedItems.reduce((a, b) => a + (b.quantity || 1), 0) : 1,
    itemsList: normalizedItems.length > 0 ? normalizedItems.map(i => `${i.name} (x${i.quantity || 1})`) : ['Concierge Item'],
    items: normalizedItems,
    totalAmount: Number(totalAmount) || 1200,
    appliedCoupon: appliedCoupon || null,
    orderType: 'Store Pickup',
    paymentMethod: paymentMethod || 'AXIONIX Verified POS',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Completed'
  };

  orders.unshift(newOrder);

  if (appliedCoupon) {
    const couponRedemption = {
      id: 'rdm-' + Date.now(),
      couponId: 'cpn-' + appliedCoupon,
      couponCode: appliedCoupon,
      customerName: customerName && customerName.trim() ? customerName : 'Reynold Ricky',
      customerPhone: customerPhone || '+91 98987 65432',
      redeemedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      storeName: finalStoreName,
      discountApplied: 'Applied at Checkout',
      savingsAmount: `₹${req.body.discountAmount ? Number(req.body.discountAmount).toLocaleString() : '1,500'} Saved`,
      channel: 'WiFi Captive Portal',
      orderNumber: newOrder.orderNumber,
      vipStatus: true
    };
    couponRedemptions.unshift(couponRedemption);
    broadcastEvent('COUPON_REDEEMED', couponRedemption);
  }

  // Update revenue today for involved brands
  if (distinctStores.length > 0) {
    distinctStores.forEach(st => {
      const brand = brands.find(b => b.name.toLowerCase() === st.toLowerCase());
      if (brand) {
        brand.revenueToday += Math.round(newOrder.totalAmount / distinctStores.length);
        brand.ordersCount += 1;
      }
    });
  }

  const log = {
    id: 'act-' + Date.now(),
    timestamp: newOrder.timestamp,
    userName: newOrder.customerName,
    action: 'ordered',
    detail: `Order ${newOrder.orderNumber} at ${finalStoreName} (₹${newOrder.totalAmount.toLocaleString()})`,
    storeName: finalStoreName,
    badgeType: 'purple'
  };
  activityLogs.unshift(log);

  broadcastEvent('NEW_ORDER', newOrder);
  res.json({ success: true, order: newOrder });
});

app.patch('/api/orders/:id/status', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (order) {
    order.status = req.body.status;
    broadcastEvent('ORDER_STATUS_UPDATE', order);
    return res.json({ success: true, order });
  }
  res.status(404).json({ success: false, message: 'Order not found' });
});

// ----------------------------------------------------------------------------
// FEATURE 08 — ADVANCED RESERVATION MANAGEMENT & CALENDAR BACKEND ENGINE
// ----------------------------------------------------------------------------
let slotCapacities = {
  // Food & Dining (All 6 Venues)
  'Starbucks Reserve': { default: 8, '16:00 PM': 8, '17:00 PM': 8, '18:30 PM': 6, '20:00 PM': 6 },
  'Häagen-Dazs': { default: 6, '16:00 PM': 6, '17:00 PM': 6, '18:30 PM': 6, '20:00 PM': 6 },
  'Din Tai Fung': { default: 6, '17:00 PM': 6, '18:30 PM': 6, '20:00 PM': 6, '21:30 PM': 4 },
  'PizzaExpress Gourmet': { default: 8, '17:00 PM': 8, '18:30 PM': 8, '20:00 PM': 8 },
  'Coffee Drama Cafe': { default: 6, '16:00 PM': 6, '17:00 PM': 6, '18:30 PM': 6 },
  'Subway Fresh Gourmet': { default: 6, '12:00 PM': 6, '14:00 PM': 6, '17:00 PM': 6 },

  // Fashion & Apparel (All 6 Boutiques)
  'Nike Flagship': { default: 4, '14:00 PM': 4, '16:00 PM': 4, '17:00 PM': 4, '18:30 PM': 3 },
  'Zara Flagship': { default: 5, '16:00 PM': 5, '17:00 PM': 5, '18:30 PM': 4 },
  'Zara Boutique': { default: 5, '16:00 PM': 5, '17:00 PM': 5, '18:30 PM': 4 },
  'Gucci Boutique': { default: 3, '16:00 PM': 3, '17:00 PM': 3, '18:30 PM': 3 },
  'Prada Atelier': { default: 3, '16:00 PM': 3, '17:00 PM': 3, '18:30 PM': 3 },
  'U.S. Polo Assn.': { default: 4, '16:00 PM': 4, '17:00 PM': 4, '18:30 PM': 4 },
  'H&M Flagship': { default: 5, '16:00 PM': 5, '17:00 PM': 5, '18:30 PM': 5 },

  // Accessories, Watches, Luxury & Beauty (All 8 Venues)
  'Rolex Boutique': { default: 2, '16:00 PM': 2, '17:00 PM': 2, '18:30 PM': 2 },
  'Louis Vuitton Maison': { default: 3, '16:00 PM': 3, '17:00 PM': 3, '18:30 PM': 3 },
  'Tiffany & Co.': { default: 3, '16:00 PM': 3, '17:00 PM': 3, '18:30 PM': 3 },
  'Cartier High Jewelry': { default: 2, '16:00 PM': 2, '17:00 PM': 2, '18:30 PM': 2 },
  'Apple Experience Store': { default: 6, '14:00 PM': 6, '16:00 PM': 6, '17:00 PM': 6 },
  'Ray-Ban Sunglass Hut': { default: 4, '14:00 PM': 4, '16:00 PM': 4, '17:00 PM': 4 },
  'Sephora Beauty': { default: 4, '14:00 PM': 4, '16:00 PM': 4, '17:00 PM': 4 },
  "PVR Director's Cut": { default: 10, '17:00 PM': 10, '20:00 PM': 10 }
};

let waitlist = [
  {
    id: 'wt-1',
    storeName: 'Starbucks Reserve',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '18:30 PM',
    guestName: 'Ananya Sharma',
    guestPhone: '+91 98555 66778',
    partySize: 2,
    specialNotes: 'VIP window seat if open',
    status: 'Waiting',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

const STANDARD_TIME_SLOTS = ['12:00 PM', '14:00 PM', '16:00 PM', '17:00 PM', '18:30 PM', '20:00 PM', '21:30 PM'];

function getSlotCapacityForStore(storeName, timeSlot) {
  const storeCaps = slotCapacities[storeName] || {};
  if (timeSlot && storeCaps[timeSlot] !== undefined) return Number(storeCaps[timeSlot]);
  if (storeCaps.default !== undefined) return Number(storeCaps.default);
  return 6;
}

function calculateStoreAvailability(storeName, targetDate) {
  const dateStr = targetDate || new Date().toISOString().split('T')[0];
  const activeRes = reservations.filter(r => 
    (r.storeName === storeName || r.venue === storeName) && 
    (r.date === dateStr || (r.date === 'Today' && dateStr === new Date().toISOString().split('T')[0])) &&
    r.status !== 'Cancelled' && 
    r.status !== 'No Show'
  );

  return STANDARD_TIME_SLOTS.map(slot => {
    const maxCapacity = getSlotCapacityForStore(storeName, slot);
    const cleanSlot = slot.replace(' PM', '').replace(' AM', '');
    const slotRes = activeRes.filter(r => (r.timeSlot || '').includes(cleanSlot) || r.timeSlot === slot);
    const bookedCount = slotRes.reduce((sum, r) => sum + (Number(r.partySize) || 1), 0);
    const available = Math.max(0, maxCapacity - bookedCount);
    const isFull = available <= 0;
    const waitingCount = waitlist.filter(w => 
      w.storeName === storeName && 
      (w.date === dateStr || w.date === 'Today') && 
      w.timeSlot === slot && 
      w.status === 'Waiting'
    ).length;

    return {
      timeSlot: slot,
      maxCapacity,
      bookedCount,
      available,
      isFull,
      waitlistCount: waitingCount,
      activeReservations: slotRes
    };
  });
}

// 6. VIP Reservations Routes
app.get('/api/reservations', (req, res) => {
  res.json({ success: true, reservations: reservations });
});

// Slot Availability Check Endpoint (Feature 08)
app.get('/api/reservations/availability', (req, res) => {
  const store = req.query.store || 'Starbucks Reserve';
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const slots = calculateStoreAvailability(store, date);
  res.json({ success: true, store, date, slots });
});

// Slot Capacity Management Endpoints (Feature 08)
app.get('/api/reservations/capacity', (req, res) => {
  const { store } = req.query;
  if (store) {
    return res.json({ success: true, store, capacities: slotCapacities[store] || { default: 6 } });
  }
  res.json({ success: true, capacities: slotCapacities });
});

app.post('/api/reservations/capacity', (req, res) => {
  const { storeName, timeSlot, capacity, defaultCapacity } = req.body;
  if (!storeName) {
    return res.status(400).json({ success: false, message: 'storeName is required' });
  }

  if (!slotCapacities[storeName]) {
    slotCapacities[storeName] = { default: 6 };
  }

  if (timeSlot && capacity !== undefined) {
    slotCapacities[storeName][timeSlot] = Number(capacity);
  }
  if (defaultCapacity !== undefined) {
    slotCapacities[storeName].default = Number(defaultCapacity);
  }

  broadcastEvent('CAPACITY_UPDATED', { storeName, capacities: slotCapacities[storeName] });
  res.json({ success: true, storeName, capacities: slotCapacities[storeName] });
});

// Waitlist Endpoints (Feature 08)
app.get('/api/reservations/waitlist', (req, res) => {
  const { store, date } = req.query;
  let list = waitlist;
  if (store) {
    list = list.filter(w => w.storeName === store);
  }
  if (date) {
    list = list.filter(w => w.date === date || w.date === 'Today');
  }
  res.json({ success: true, waitlist: list });
});

app.post('/api/reservations/waitlist', (req, res) => {
  const { storeName, date, timeSlot, guestName, guestPhone, partySize, specialNotes } = req.body;
  const targetDate = date || new Date().toISOString().split('T')[0];
  const targetSlot = timeSlot || '18:30 PM';

  const newEntry = {
    id: 'wt-' + Date.now(),
    storeName: storeName || 'Starbucks Reserve',
    date: targetDate,
    timeSlot: targetSlot,
    guestName: guestName && guestName.trim() ? guestName : 'Valued Guest',
    guestPhone: guestPhone || '+91 84950 93170',
    partySize: Number(partySize) || 2,
    specialNotes: specialNotes || 'VIP Waitlist',
    status: 'Waiting',
    createdAt: new Date().toISOString()
  };

  waitlist.unshift(newEntry);
  const position = waitlist.filter(w => 
    w.storeName === newEntry.storeName && 
    w.timeSlot === newEntry.timeSlot && 
    w.date === newEntry.date && 
    w.status === 'Waiting'
  ).length;

  broadcastEvent('WAITLIST_JOINED', { entry: newEntry, position });
  res.json({ success: true, waitlistEntry: newEntry, position });
});

// Convert Waitlist to Confirmed Reservation
app.post('/api/reservations/waitlist/:id/confirm', (req, res) => {
  const entry = waitlist.find(w => w.id === req.params.id);
  if (!entry) {
    return res.status(404).json({ success: false, message: 'Waitlist entry not found' });
  }

  entry.status = 'Booked';
  const newRes = {
    id: 'RES-' + (reservations.length + 303),
    refCode: 'RES-' + Math.floor(1000 + Math.random() * 9000),
    guestName: entry.guestName,
    guestPhone: entry.guestPhone,
    storeName: entry.storeName,
    partySize: entry.partySize,
    timeSlot: entry.timeSlot,
    date: entry.date,
    status: 'Confirmed',
    specialNotes: `Promoted from Waitlist • ${entry.specialNotes || ''}`
  };

  reservations.unshift(newRes);
  broadcastEvent('WAITLIST_PROMOTED', {
    waitlistEntry: entry,
    reservation: newRes,
    guestPhone: entry.guestPhone,
    storeName: entry.storeName,
    timeSlot: entry.timeSlot
  });
  broadcastEvent('NEW_RESERVATION', newRes);

  res.json({ success: true, reservation: newRes, waitlistEntry: entry });
});

// No-Show Tracking Endpoint (Feature 08)
app.post('/api/reservations/:id/no-show', (req, res) => {
  const targetId = String(req.params.id);
  const resObj = reservations.find(r => String(r.id) === targetId || String(r.refCode) === targetId);

  if (!resObj) {
    return res.status(404).json({ success: false, message: 'Reservation not found' });
  }

  resObj.status = 'No Show';

  // Check waitlist for waiting guest to auto-promote / notify
  const targetDate = resObj.date || new Date().toISOString().split('T')[0];
  const waitingGuest = waitlist.find(w => 
    w.storeName === resObj.storeName && 
    (w.date === targetDate || w.date === 'Today') && 
    w.timeSlot === resObj.timeSlot && 
    w.status === 'Waiting'
  );

  let waitlistNotified = null;
  if (waitingGuest) {
    waitingGuest.status = 'Notified';
    waitlistNotified = waitingGuest;

    broadcastEvent('WAITLIST_PROMOTED', {
      waitlistEntry: waitingGuest,
      storeName: resObj.storeName,
      timeSlot: resObj.timeSlot,
      date: targetDate,
      guestPhone: waitingGuest.guestPhone,
      guestName: waitingGuest.guestName,
      message: `Table freed! You have been promoted on the waitlist for ${resObj.storeName} at ${resObj.timeSlot}`
    });
  }

  broadcastEvent('RESERVATION_NO_SHOW', {
    reservation: resObj,
    freedSlot: { storeName: resObj.storeName, timeSlot: resObj.timeSlot, date: targetDate },
    promotedGuest: waitlistNotified
  });

  broadcastEvent('RESERVATION_SLOT_FREED', {
    storeName: resObj.storeName,
    timeSlot: resObj.timeSlot,
    date: targetDate,
    promotedGuest: waitlistNotified
  });

  res.json({
    success: true,
    message: 'Reservation marked as No-Show. Slot has been freed.',
    reservation: resObj,
    waitlistNotified
  });
});

// Customer Reservation Cancellation Endpoint
app.post('/api/reservations/cancel', (req, res) => {
  const { id, refCode, storeName, date, timeSlot } = req.body;
  const targetId = String(id || refCode);
  const resObj = reservations.find(r => String(r.id) === targetId || String(r.refCode) === targetId || (refCode && r.refCode === refCode));

  if (resObj) {
    resObj.status = 'Cancelled';
  }

  const targetDate = date || (resObj ? resObj.date : new Date().toISOString().split('T')[0]);
  const targetSlot = timeSlot || (resObj ? resObj.timeSlot : '17:00 PM');
  const targetStoreName = storeName || (resObj ? resObj.storeName : '');

  // Check waitlist for waiting guest to auto-promote / notify
  const waitingGuest = waitlist.find(w => 
    w.storeName === targetStoreName && 
    (w.date === targetDate || w.date === 'Today') && 
    w.timeSlot === targetSlot && 
    w.status === 'Waiting'
  );

  let waitlistNotified = null;
  if (waitingGuest) {
    waitingGuest.status = 'Notified';
    waitlistNotified = waitingGuest;

    broadcastEvent('WAITLIST_PROMOTED', {
      waitlistEntry: waitingGuest,
      storeName: targetStoreName,
      timeSlot: targetSlot,
      date: targetDate,
      guestPhone: waitingGuest.guestPhone,
      guestName: waitingGuest.guestName,
      message: `Table freed! You have been promoted on the waitlist for ${targetStoreName} at ${targetSlot}`
    });
  }

  broadcastEvent('RESERVATION_CANCELLED', {
    id: targetId,
    refCode: refCode || (resObj ? resObj.refCode : ''),
    storeName: targetStoreName,
    timeSlot: targetSlot,
    date: targetDate,
    freedSlot: { storeName: targetStoreName, timeSlot: targetSlot, date: targetDate },
    promotedGuest: waitlistNotified
  });

  broadcastEvent('RESERVATION_SLOT_FREED', {
    storeName: targetStoreName,
    timeSlot: targetSlot,
    date: targetDate,
    promotedGuest: waitlistNotified
  });

  res.json({
    success: true,
    message: 'Reservation cancelled successfully. Slot freed.',
    waitlistNotified
  });
});

app.delete('/api/reservations/:id', (req, res) => {
  const targetId = String(req.params.id);
  const idx = reservations.findIndex(r => String(r.id) === targetId || String(r.refCode) === targetId);
  if (idx !== -1) {
    const deleted = reservations.splice(idx, 1)[0];
    broadcastEvent('RESERVATION_CANCELLED', { id: targetId, reservation: deleted });
    return res.json({ success: true, message: 'Reservation removed successfully' });
  }
  res.status(404).json({ success: false, message: 'Reservation not found' });
});

// Drag-and-Drop Rescheduling Endpoint (Feature 08)
app.patch('/api/reservations/:id/reschedule', (req, res) => {
  const targetId = String(req.params.id);
  const { date, timeSlot, storeName } = req.body;
  const resObj = reservations.find(r => String(r.id) === targetId || String(r.refCode) === targetId);

  if (!resObj) {
    return res.status(404).json({ success: false, message: 'Reservation not found' });
  }

  if (date) resObj.date = date;
  if (timeSlot) resObj.timeSlot = timeSlot;
  if (storeName) resObj.storeName = storeName;

  broadcastEvent('RESERVATION_RESCHEDULED', { reservation: resObj });
  res.json({ success: true, reservation: resObj });
});

// Update Status Generic Endpoint
app.patch('/api/reservations/:id/status', (req, res) => {
  const targetId = String(req.params.id);
  const { status } = req.body;
  const resObj = reservations.find(r => String(r.id) === targetId || String(r.refCode) === targetId);

  if (resObj) {
    resObj.status = status || resObj.status;
    broadcastEvent('RESERVATION_STATUS_UPDATE', { reservation: resObj });
    return res.json({ success: true, reservation: resObj });
  }
  res.status(404).json({ success: false, message: 'Reservation not found' });
});

app.post('/api/reservations', (req, res) => {
  const { id, refCode, storeName, guestName, guestPhone, partySize, timeSlot, date, specialNotes } = req.body;
  const targetDate = date || new Date().toISOString().split('T')[0];
  const targetSlot = timeSlot || '17:00 PM';
  const cleanGuest = (guestName || 'yoshi').trim().toLowerCase();
  const cleanStore = (storeName || 'Starbucks Reserve').trim().toLowerCase();

  // Deduplication check: if reservation exists with matching refCode, id, or same guest+store+slot+date
  const existing = reservations.find(r => 
    (refCode && r.refCode === refCode) ||
    (id && r.id === id) ||
    (r.guestName && r.guestName.trim().toLowerCase() === cleanGuest && 
     r.storeName && r.storeName.trim().toLowerCase() === cleanStore && 
     (r.timeSlot === targetSlot || (r.timeSlot && r.timeSlot.includes(targetSlot.replace(' PM', '').replace(' AM', '')))) && 
     (r.date === targetDate || r.date === 'Today'))
  );

  if (existing) {
    return res.json({ success: true, reservation: existing, duplicatePrevented: true });
  }

  const newRes = {
    id: id || ('RES-' + (reservations.length + 303)),
    refCode: refCode || ('RES-' + Math.floor(1000 + Math.random() * 9000)),
    guestName: guestName || 'yoshi',
    guestPhone: guestPhone || '+91 84950 93170',
    storeName: storeName || 'Starbucks Reserve',
    partySize: Number(partySize) || 2,
    timeSlot: targetSlot,
    date: targetDate,
    status: 'Confirmed',
    specialNotes: specialNotes || 'VIP Fitting Suite'
  };

  reservations.unshift(newRes);

  const brand = brands.find(b => b.name === storeName);
  if (brand) {
    brand.reservationsCount += 1;
  }

  broadcastEvent('NEW_RESERVATION', newRes);
  res.json({ success: true, reservation: newRes });
});

// 7. Admin Metrics Routes
app.get('/api/admin/metrics', (req, res) => {
  const brandRev = brands.reduce((acc, b) => acc + (Number(b.revenueToday) || 0), 0);
  const totalRevenue = brandRev;
  const storeVisits = brands.reduce((acc, b) => acc + (Number(b.visitorsToday) || 0), 0);
  const totalFootfall = storeVisits;
  const activeUsers = connectedUsers.filter(u => u.status === 'Active').length || 6;
  const totalUsers = connectedUsers.length || 12;
  const totalOrders = brands.reduce((acc, b) => acc + (Number(b.ordersCount) || 0), 0);
  const totalReservations = reservations.length;
  const totalRedemptions = couponRedemptions.length;

  res.json({
    success: true,
    totalRevenue,
    totalFootfall,
    storeVisits,
    activeUsers,
    totalUsers,
    activeStores: brands.length,
    totalOrders,
    totalReservations,
    totalRedemptions
  });
});

let loyaltyAccounts = [
  { userId: '10000000-0000-0000-0000-000000000001', pointsBalance: 1850, tier: 'Silver', lifetimePoints: 3450 },
  { userId: '10000000-0000-0000-0000-000000000005', pointsBalance: 6200, tier: 'Gold', lifetimePoints: 9800 },
  { userId: '10000000-0000-0000-0000-000000000009', pointsBalance: 16400, tier: 'Platinum', lifetimePoints: 22100 }
];

function computeTierFromPoints(points) {
  if (points >= 15000) return 'Platinum';
  if (points >= 5000) return 'Gold';
  if (points >= 1000) return 'Silver';
  return 'Bronze';
}

// 8. Loyalty Points & Rewards System Routes
app.get('/api/loyalty/:userId', (req, res) => {
  const { userId } = req.params;
  let account = loyaltyAccounts.find(a => a.userId === userId);
  if (!account) {
    account = {
      userId,
      pointsBalance: 250, // Welcome bonus
      tier: 'Bronze',
      lifetimePoints: 250
    };
    loyaltyAccounts.push(account);
  }
  res.json({ success: true, account });
});

app.post('/api/loyalty/earn', (req, res) => {
  const { userId, amountSpent } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

  const pointsEarned = Math.floor((Number(amountSpent) || 0) / 10); // ₹100 = 10 pts
  let account = loyaltyAccounts.find(a => a.userId === userId);

  if (!account) {
    account = {
      userId,
      pointsBalance: 250 + pointsEarned,
      tier: computeTierFromPoints(250 + pointsEarned),
      lifetimePoints: 250 + pointsEarned
    };
    loyaltyAccounts.push(account);
  } else {
    account.pointsBalance += pointsEarned;
    account.lifetimePoints += pointsEarned;
    const newTier = computeTierFromPoints(account.lifetimePoints);
    if (newTier !== account.tier) {
      account.tier = newTier;
      broadcastEvent('LOYALTY_UPGRADE', { userId, newTier, pointsBalance: account.pointsBalance });
    }
  }

  broadcastEvent('POINTS_EARNED', { userId, pointsEarned, pointsBalance: account.pointsBalance, tier: account.tier });
  res.json({ success: true, account, pointsEarned });
});

app.post('/api/loyalty/redeem', (req, res) => {
  const { userId, pointsToRedeem } = req.body;
  if (!userId || !pointsToRedeem) {
    return res.status(400).json({ success: false, message: 'userId and pointsToRedeem required' });
  }

  let account = loyaltyAccounts.find(a => a.userId === userId);
  if (!account || account.pointsBalance < pointsToRedeem) {
    return res.status(400).json({ success: false, message: 'Insufficient loyalty points balance' });
  }

  const discountValue = Math.floor(pointsToRedeem / 10); // 10 pts = ₹1 discount
  account.pointsBalance -= pointsToRedeem;

  broadcastEvent('POINTS_REDEEMED', { userId, pointsRedeemed: pointsToRedeem, discountValue, remainingBalance: account.pointsBalance });
  res.json({ success: true, account, discountValue });
});

app.get('/api/loyalty/admin/stats', (req, res) => {
  const totalPointsBalance = loyaltyAccounts.reduce((acc, a) => acc + a.pointsBalance, 0);
  const totalLifetimePoints = loyaltyAccounts.reduce((acc, a) => acc + a.lifetimePoints, 0);
  const tierDistribution = {
    Bronze: loyaltyAccounts.filter(a => a.tier === 'Bronze').length,
    Silver: loyaltyAccounts.filter(a => a.tier === 'Silver').length,
    Gold: loyaltyAccounts.filter(a => a.tier === 'Gold').length,
    Platinum: loyaltyAccounts.filter(a => a.tier === 'Platinum').length
  };

  res.json({
    success: true,
    stats: {
      totalAccounts: loyaltyAccounts.length,
      totalPointsBalance,
      totalLifetimePoints,
      tierDistribution,
      topEarners: [...loyaltyAccounts].sort((a, b) => b.lifetimePoints - a.lifetimePoints).slice(0, 5)
    }
  });
});

// 9. QR Code & Smart Wayfinder Routes
app.get('/api/qr/:type/:id', (req, res) => {
  const { type, id } = req.params;
  if (type === 'store') {
    const brand = brands.find(b => b.id === id || b.name.toLowerCase() === id.toLowerCase());
    return res.json({ success: true, type: 'store', data: brand || null });
  }
  if (type === 'product') {
    let itemFound = null;
    brands.forEach(b => {
      const match = (b.items || []).find(i => i.id === id);
      if (match) itemFound = { ...match, brandName: b.name };
    });
    return res.json({ success: true, type: 'product', data: itemFound });
  }
  if (type === 'coupon') {
    const cpn = coupons.find(c => c.id === id || c.code.toUpperCase() === id.toUpperCase());
    return res.json({ success: true, type: 'coupon', data: cpn || null });
  }
  if (type === 'wayfinder') {
    return res.json({ success: true, type: 'wayfinder', data: { zone: 'Ground Floor Atrium', mapUrl: '/wayfinder' } });
  }
  res.status(400).json({ success: false, message: 'Invalid QR entity type' });
});

app.post('/api/qr/scan', (req, res) => {
  const { type, id, userName, storeName } = req.body;
  const log = {
    id: 'act-' + Date.now(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    userName: userName || 'Shopper',
    action: 'scanned_qr',
    detail: `Scanned ${type.toUpperCase()} QR code for ${id}`,
    storeName: storeName || 'Grand Mall Entrance',
    badgeType: 'blue'
  };
  activityLogs.unshift(log);

  broadcastEvent('QR_SCANNED', { type, id, userName, timestamp: log.timestamp });
  res.json({ success: true, log });
});

app.get('/api/admin/backup/export', (req, res) => {
  res.json({
    exportTimestamp: new Date().toISOString(),
    brands,
    connectedUsers,
    orders,
    reservations,
    coupons,
    couponRedemptions,
    loyaltyAccounts,
    activityLogs
  });
});

// Initialize Live Data Hydration from Supabase
async function hydrateBackendFromSupabase() {
  try {
    const { data: supaBrands } = await supabase.from('brands').select('*');
    if (supaBrands && supaBrands.length > 0) {
      supaBrands.forEach(sb => {
        const match = brands.find(b => b.name.toLowerCase() === sb.name.toLowerCase() || b.id === sb.id);
        if (match) {
          match.id = sb.id;
          match.name = sb.name;
          match.category = sb.category || match.category;
          match.floor = sb.floor || match.floor;
          match.zone = sb.zone || match.zone;
          match.status = sb.status || match.status;
          match.openHours = sb.open_hours || match.openHours;
          match.rating = sb.rating || match.rating;
        } else {
          brands.push({
            id: sb.id,
            name: sb.name,
            category: sb.category || 'General',
            floor: sb.floor || 'Ground Floor',
            zone: sb.zone || 'Central Atrium',
            visitorsToday: 250,
            ordersCount: 25,
            reservationsCount: 5,
            conversionRate: 22.5,
            revenueToday: 450000,
            status: sb.status || 'open',
            manager: 'Store Manager',
            phone: '+91 80 4930 1000',
            openHours: sb.open_hours || '10:00 AM - 10:00 PM',
            rating: sb.rating || 4.9,
            logo: '🛍️',
            items: []
          });
        }
      });
    }

    const { data: supaOrders } = await supabase.from('orders').select('*, order_items(*, products(*))').order('created_at', { ascending: false });
    if (supaOrders && supaOrders.length > 0) {
      supaOrders.forEach(o => {
        const orderId = o.id;
        const existingIdx = orders.findIndex(ord => ord.id === orderId || ord.orderNumber === o.order_number);
        const mapped = {
          id: o.id,
          orderNumber: o.order_number || `#AX-${o.id.slice(0, 4).toUpperCase()}`,
          customerName: o.customer_name || 'Mall Guest',
          customerPhone: o.customer_phone || '+91 98000 00000',
          storeName: o.store_name || 'Mall Store',
          storeCategory: 'Fashion',
          itemsCount: o.order_items?.length || 1,
          itemsList: o.order_items?.map(i => `${i.products?.name || 'Item'} (x${i.quantity || 1})`) || ['Store Purchase'],
          totalAmount: Number(o.total_amount) || Number(o.subtotal) || 0,
          orderType: o.order_type || 'Store Pickup',
          paymentMethod: o.payment_method || 'Credit Card',
          timestamp: o.created_at ? new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
          status: o.status || 'Completed'
        };
        if (existingIdx !== -1) {
          orders[existingIdx] = { ...orders[existingIdx], ...mapped };
        } else {
          orders.unshift(mapped);
        }
      });
    }

    const { data: supaRes } = await supabase.from('reservations').select('*').order('created_at', { ascending: false });
    if (supaRes && supaRes.length > 0) {
      supaRes.forEach(r => {
        const resId = r.id;
        const existingIdx = reservations.findIndex(res => res.id === resId || res.refCode === r.ref_code);
        const mapped = {
          id: r.id,
          refCode: r.ref_code || `RES-${r.id.slice(0, 4).toUpperCase()}`,
          guestName: r.guest_name || 'Guest User',
          guestPhone: r.guest_phone || '+91 98000 00000',
          storeName: 'Mall Store',
          partySize: Number(r.party_size) || 2,
          timeSlot: r.time_slot || '17:00 PM',
          date: r.created_at ? r.created_at.split('T')[0] : 'Today',
          status: r.status || 'Confirmed',
          specialNotes: r.notes || 'VIP Fitting Suite'
        };
        if (existingIdx !== -1) {
          reservations[existingIdx] = { ...reservations[existingIdx], ...mapped };
        } else {
          reservations.unshift(mapped);
        }
      });
    }
  } catch (err) {
    console.warn('[AXIONIX Backend] Supabase startup hydration note:', err.message);
  }
}

// ----------------------------------------------------------------------------
// FEATURE 12 — INVENTORY MANAGEMENT & LOW-STOCK ALERTS API
// ----------------------------------------------------------------------------
app.patch('/api/products/:id/stock', (req, res) => {
  const { id } = req.params;
  const { quantity, operation, sku, minStock } = req.body;
  const qtyNum = Number(quantity) || 0;

  broadcastEvent('INVENTORY_STOCK_UPDATED', {
    productId: id,
    quantity: qtyNum,
    operation: operation || 'set',
    sku: sku || undefined,
    minStock: minStock || 10,
    timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    message: `Stock updated for product ${id}`,
    product: {
      id,
      stockQuantity: qtyNum,
      sku: sku || `SKU-${id.toUpperCase()}`,
      minStock: minStock || 10,
      updatedAt: new Date().toISOString()
    }
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`⚡ AXIONIX Backend Microservice listening on http://localhost:${PORT}`);
    hydrateBackendFromSupabase();
  });
} else {
  hydrateBackendFromSupabase();
}

export default app;
