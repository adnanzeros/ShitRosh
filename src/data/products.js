// FILE: src/data/products.js
export const DELIVERY = { dhaka: 60, outside: 120, freeAbove: 2000 };

export const products = [
  { id: "jhola", name: "ঝোলা খেজুরের গুড়", short: "ঝোলা", desc: "টাটকা রসে জ্বাল দেওয়া তরল, সুগন্ধি ঝোলা গুড়। রুটি, পিঠা আর পায়েসের সেরা সঙ্গী।", image: "/images/jhola.png", tone: "#E9A23B",
    variants: [{ w: "৫০০ গ্রাম", price: 450 }, { w: "১ কেজি", price: 850 }, { w: "২ কেজি", price: 1650 }] },
  { id: "patali", name: "পাটালি খেজুরের গুড়", short: "পাটালি", desc: "শীতের সকালের ঐতিহ্য — জমাট, মিষ্টি আর ধোঁয়াটে ঘ্রাণের পাটালি।", image: "/images/patali.png", tone: "#C96B25",
    variants: [{ w: "৫০০ গ্রাম", price: 520 }, { w: "১ কেজি", price: 990 }, { w: "২ কেজি", price: 1950 }] },
  // id kept as "danadar" so old orders/links keep working; the photo is the jar of bij (granular) gur
  { id: "danadar", name: "দানাদার খেজুরের গুড় (বীজ গুড়)", short: "বীজ", desc: "ঝুরঝুরে দানাদার গুড়, দীর্ঘদিন সংরক্ষণ করা যায়।", image: "/images/bij.png", tone: "#F26A10",
    variants: [{ w: "৫০০ গ্রাম", price: 480 }, { w: "১ কেজি", price: 900 }, { w: "২ কেজি", price: 1750 }] },
  { id: "combo", name: "খেজুরের গুড়ের কম্বো", short: "কম্বো", desc: "ঝোলা, পাটালি ও দানাদার — তিন স্বাদের উপহার বক্স।", image: "/images/patali.png", images: ["/images/jhola.png", "/images/patali.png", "/images/bij.png"], tone: "#386B4D",
    variants: [{ w: "৩ কেজি বক্স", price: 2650 }, { w: "৫ কেজি বক্স", price: 4300 }] },
];

export const districts = ["ঢাকা","গাজীপুর","নারায়ণগঞ্জ","চট্টগ্রাম","রাজবাড়ী","ফরিদপুর","যশোর","খুলনা","রাজশাহী","বগুড়া","রংপুর","সিলেট","ময়মনসিংহ","বরিশাল","কুমিল্লা","অন্যান্য"];