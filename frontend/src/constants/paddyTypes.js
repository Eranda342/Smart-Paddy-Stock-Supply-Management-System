export const PADDY_TYPES_GROUPED = {
  "Traditional Varieties": [
    "Samba",
    "Nadu",
    "Keeri Samba",
    "Kakulu",
    "Suwandel",
    "Pachchaperumal",
    "Madathawalu",
    "Kuruluthuda",
  ],
  "Improved Varieties (BG Series)": [
    "Bg 352",
    "Bg 358",
    "Bg 360",
    "Bg 366",
    "Bg 379-2",
    "Bg 94-1",
  ],
  "Improved Varieties (AT Series)": [
    "At 362",
    "At 306",
    "At 405",
  ],
  "Other Improved Varieties": [
    "Ld 365",
    "Ld 368",
    "H4",
    "Bw 367",
    "Bw 363",
  ],
  "Specialty Rice": [
    "Red Rice",
    "White Rice",
  ],
};

// Flat list derived from grouped — kept for backward compatibility
export const PADDY_TYPES = Object.values(PADDY_TYPES_GROUPED).flat();

export const DISTRICTS = [
  "Ampara","Anuradhapura","Badulla","Batticaloa","Colombo",
  "Galle","Gampaha","Hambantota","Jaffna","Kalutara",
  "Kandy","Kegalle","Kilinochchi","Kurunegala","Mannar",
  "Matale","Matara","Monaragala","Mullaitivu","Nuwara Eliya",
  "Polonnaruwa","Puttalam","Ratnapura","Trincomalee","Vavuniya"
];
