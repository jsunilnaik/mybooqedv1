export interface CityMetadata {
  state: string;
  stateCode: string;
  fullName: string;
  neighborhoods: string[];
}

export const CITY_NEIGHBORHOODS: Record<string, CityMetadata> = {
  "ballari": {
    state: "Karnataka",
    stateCode: "ka",
    fullName: "Ballari City",
    neighborhoods: [
      "Cowl Bazaar",
      "Cantonment",
      "Millerpet",
      "Satya Narayana Pet (S.N. Pet)",
      "Gandhi Nagar",
      "Patel Nagar",
      "Kuvempu Nagar",
      "Parvathi Nagar",
      "Vidya Nagar",
      "Basaveshwar Nagar",
      "Guggarahatti",
      "KHB Colony",
      "Radio Park",
      "Allipura",
      "Talab Katta"
    ]
  },
  "mumbai": {
    state: "Maharashtra",
    stateCode: "mh",
    fullName: "Mumbai",
    neighborhoods: [
      "Colaba",
      "Fort",
      "Bandra",
      "Andheri",
      "Juhu",
      "Dadar",
      "Worli",
      "Malad",
      "Borivali",
      "Chembur",
      "Kurla",
      "Powai",
      "Ghatkopar",
      "Vikhroli",
      "Goregaon"
    ]
  },
  "jaipur": {
    state: "Rajasthan",
    stateCode: "rj",
    fullName: "Jaipur",
    neighborhoods: [
      "Mansarovar",
      "Malviya Nagar",
      "Vaishali Nagar",
      "C-Scheme",
      "Bapu Nagar",
      "Raja Park",
      "Bani Park",
      "Jagatpura",
      "Vidyadhar Nagar",
      "Jhotwara",
      "Sanganer",
      "Civil Lines"
    ]
  },
  "delhi": {
    state: "Delhi (NCT)",
    stateCode: "dl",
    fullName: "Delhi",
    neighborhoods: [
      "Connaught Place",
      "Saket",
      "Dwarka",
      "Rohini",
      "Hauz Khas",
      "Karol Bagh",
      "Vasant Kunj",
      "Greater Kailash",
      "Lajpat Nagar",
      "Mayur Vihar",
      "Rajouri Garden",
      "Janakpuri",
      "Chanakyapuri"
    ]
  },
  "bengaluru": {
    state: "Karnataka",
    stateCode: "ka",
    fullName: "Bengaluru",
    neighborhoods: [
      "Koramangala",
      "Indiranagar",
      "Jayanagar",
      "Whitefield",
      "Malleshwaram",
      "HSR Layout",
      "Basavanagudi",
      "BTM Layout",
      "Yelahanka",
      "Electronic City",
      "Marathahalli",
      "Rajajinagar",
      "Banashankari",
      "Hebbal"
    ]
  },
  "hyderabad": {
    state: "Telangana",
    stateCode: "tg",
    fullName: "Hyderabad",
    neighborhoods: [
      "Banjara Hills",
      "Jubilee Hills",
      "HITEC City",
      "Gachibowli",
      "Kukatpally",
      "Secunderabad",
      "Ameerpet",
      "Begumpet",
      "Madhapur",
      "Kondapur",
      "Somajiguda",
      "Charminar",
      "Dilsukhnagar",
      "Tolichowki"
    ]
  },
  "surat": {
    state: "Gujarat",
    stateCode: "gj",
    fullName: "Surat",
    neighborhoods: [
      "Adajan",
      "Vesu",
      "Varachha",
      "Piplod",
      "Rander",
      "Pal",
      "Katargam",
      "Udhna",
      "Athwa Lines",
      "Bhatar",
      "Majura Gate",
      "City Light",
      "Althan"
    ]
  },
  "ahmedabad": {
    state: "Gujarat",
    stateCode: "gj",
    fullName: "Ahmedabad",
    neighborhoods: [
      "Satellite",
      "Navrangpura",
      "Vastrapur",
      "Bopal",
      "Maninagar",
      "Prahlad Nagar",
      "Thaltej",
      "Bodakdev",
      "SG Highway",
      "Ellisbridge",
      "Paldi",
      "Gota",
      "Chandkheda",
      "Naroda"
    ]
  },
  "pune": {
    state: "Maharashtra",
    stateCode: "mh",
    fullName: "Pune",
    neighborhoods: [
      "Koregaon Park",
      "Kothrud",
      "Viman Nagar",
      "Shivaji Nagar",
      "Kalyani Nagar",
      "Baner",
      "Hinjewadi",
      "Aundh",
      "Magarpatta",
      "Wakad",
      "Hadapsar",
      "Kharadi",
      "Camp",
      "Deccan Gymkhana"
    ]
  },
  "chennai": {
    state: "Tamil Nadu",
    stateCode: "tn",
    fullName: "Chennai",
    neighborhoods: [
      "T. Nagar",
      "Adyar",
      "Anna Nagar",
      "Mylapore",
      "Besant Nagar",
      "Nungambakkam",
      "Velachery",
      "Alwarpet",
      "Guindy",
      "Thiruvanmiyur",
      "Tambaram",
      "OMR",
      "Perambur",
      "Royapettah"
    ]
  },
  "kolkata": {
    state: "West Bengal",
    stateCode: "wb",
    fullName: "Kolkata",
    neighborhoods: [
      "Park Street",
      "Ballygunge",
      "Jadavpur",
      "Salt Lake (Bidhannagar)",
      "New Town",
      "Alipore",
      "Gariahat",
      "Dum Dum",
      "Tollygunge",
      "Behala",
      "Rajarhat",
      "Kasba",
      "Bhowanipore",
      "Shyambazar"
    ]
  },
  "lucknow": {
    state: "Uttar Pradesh",
    stateCode: "up",
    fullName: "Lucknow",
    neighborhoods: [
      "Gomti Nagar",
      "Hazratganj",
      "Indira Nagar",
      "Aliganj",
      "Mahanagar",
      "Aminabad",
      "Vikas Nagar",
      "Rajajipuram",
      "Ashiyana",
      "Chowk",
      "Kapoorthala",
      "Jankipuram",
      "Aashiana",
      "Sushant Golf City"
    ]
  }
};
