export const PADDY_TYPES_GROUPED = [
  {
    category: "Common Types",
    varieties: ["Samba", "Nadu", "Keeri Samba", "Red Rice", "White Rice", "Kakulu"]
  },
  {
    category: "Traditional Varieties",
    varieties: ["Suwandel", "Pachchaperumal", "Madathawalu", "Kuruluthuda"]
  },
  {
    category: "Research Varieties",
    varieties: ["Bg 352", "Bg 358", "Bg 360", "Bg 366", "Bg 379-2", "Bg 94-1", "At 362", "At 306", "At 405", "Ld 365", "Ld 368", "H4", "Bw 367", "Bw 363"]
  }
];

export const PADDY_TYPES = PADDY_TYPES_GROUPED.flatMap(g => g.varieties);

export const DISTRICTS = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya"
];
