/*
  RateMyComplex — sample/demo dataset.
  Every complex, landlord, and review below is fictional placeholder
  content used to demonstrate the product. None of it refers to real
  businesses or people.
*/

const RMC_DATA = {
  city: "Provo, UT",
  center: [40.2500, -111.6489],
  zoom: 13,

  landlords: [
    { id: "grove-mgmt", name: "Grove Property Management" },
    { id: "summit-realty", name: "Summit Realty Partners" },
    { id: "nest-living", name: "Nest Living Co." },
    { id: "alpine-housing", name: "Alpine Housing Group" }
  ],

  complexes: [
    {
      id: "maple-grove",
      name: "Maple Grove Apartments",
      landlordId: "grove-mgmt",
      address: "450 E 700 N, Provo, UT 84606",
      lat: 40.2481, lng: -111.6438,
      price: "$425–$575/mo",
      priceMin: 425,
      beds: "Shared & private rooms, 1–4 bed",
      subRatings: { location: 4.6, value: 4.1, maintenance: 3.4, management: 3.0 },
      reviews: [
        { author: "Current Resident", rating: 4, landlordRating: 3, date: "2026-05-14", text: "Super close to campus, love being able to walk to class. Maintenance took about a week to fix our sink though." },
        { author: "Former Resident", rating: 5, landlordRating: 4, date: "2026-03-02", text: "Lived here for two years. Got my full deposit back and the office was easy to work with when I moved out." },
        { author: "Current Resident", rating: 3, landlordRating: 2, date: "2026-06-20", text: "Location can't be beat but it took three emails to get someone to look at our broken AC in June." }
      ]
    },
    {
      id: "highland-court",
      name: "Highland Court",
      landlordId: "grove-mgmt",
      address: "875 N 150 E, Provo, UT 84604",
      lat: 40.2528, lng: -111.6529,
      price: "$460–$610/mo",
      priceMin: 460,
      beds: "1–3 bed",
      subRatings: { location: 4.2, value: 3.8, maintenance: 3.9, management: 3.3 },
      reviews: [
        { author: "Current Resident", rating: 4, landlordRating: 3, date: "2026-04-28", text: "Nice quiet complex, good parking. Same management company as Maple Grove — response time is hit or miss." },
        { author: "Current Resident", rating: 4, landlordRating: 4, date: "2026-01-15", text: "Recently renovated kitchens. Genuinely happy here so far." }
      ]
    },
    {
      id: "birchwood-flats",
      name: "Birchwood Flats",
      landlordId: "summit-realty",
      address: "1220 S State St, Provo, UT 84606",
      lat: 40.2410, lng: -111.6475,
      price: "$395–$540/mo",
      priceMin: 395,
      beds: "1–4 bed",
      subRatings: { location: 3.7, value: 4.4, maintenance: 4.0, management: 4.2 },
      reviews: [
        { author: "Current Resident", rating: 5, landlordRating: 5, date: "2026-05-30", text: "Honestly one of the best landlord experiences I've had. They actually text back." },
        { author: "Former Resident", rating: 4, landlordRating: 4, date: "2026-02-19", text: "Good value for the price. A little far from campus but the bus stop is right outside." }
      ]
    },
    {
      id: "sunridge-commons",
      name: "Sunridge Commons",
      landlordId: "summit-realty",
      address: "300 W 500 N, Provo, UT 84601",
      lat: 40.2570, lng: -111.6390,
      price: "$470–$650/mo",
      priceMin: 470,
      beds: "2–4 bed",
      subRatings: { location: 4.0, value: 3.9, maintenance: 4.3, management: 4.1 },
      reviews: [
        { author: "Current Resident", rating: 4, landlordRating: 4, date: "2026-06-05", text: "Pool and gym are actually maintained, which surprised me. Rent went up more than I expected at renewal." },
        { author: "Current Resident", rating: 5, landlordRating: 5, date: "2026-03-22", text: "Reported a leak on a Sunday and someone was there Monday morning. Can't complain." }
      ]
    },
    {
      id: "the-nest-9th",
      name: "The Nest on 9th",
      landlordId: "nest-living",
      address: "980 E 900 N, Provo, UT 84604",
      lat: 40.2455, lng: -111.6555,
      price: "$440–$590/mo",
      priceMin: 440,
      beds: "1–2 bed",
      subRatings: { location: 4.4, value: 3.6, maintenance: 2.9, management: 2.6 },
      reviews: [
        { author: "Current Resident", rating: 2, landlordRating: 2, date: "2026-06-10", text: "Great location but we've had a mice problem for a month and pest control has only come once." },
        { author: "Former Resident", rating: 3, landlordRating: 2, date: "2026-04-01", text: "They tried to charge us for 'excess wear' that was just normal use. Had to dispute it to get part of our deposit back." },
        { author: "Current Resident", rating: 4, landlordRating: 3, date: "2026-02-11", text: "Unit itself is nice and updated. Just wish the office answered the phone more." }
      ]
    },
    {
      id: "canyon-view",
      name: "Canyon View Apartments",
      landlordId: "alpine-housing",
      address: "2100 N Canyon Rd, Provo, UT 84604",
      lat: 40.2600, lng: -111.6460,
      price: "$500–$700/mo",
      priceMin: 500,
      beds: "2–4 bed",
      subRatings: { location: 4.7, value: 3.5, maintenance: 4.2, management: 4.0 },
      reviews: [
        { author: "Current Resident", rating: 5, landlordRating: 4, date: "2026-05-18", text: "Views of the mountains are unreal. A bit pricier than other places near campus but worth it for us." },
        { author: "Current Resident", rating: 4, landlordRating: 4, date: "2026-01-29", text: "Solid maintenance team, they're quick." }
      ]
    },
    {
      id: "ivy-lane",
      name: "Ivy Lane Residences",
      landlordId: "alpine-housing",
      address: "640 S 200 W, Provo, UT 84601",
      lat: 40.2380, lng: -111.6520,
      price: "$380–$520/mo",
      priceMin: 380,
      beds: "1–3 bed",
      subRatings: { location: 3.4, value: 4.3, maintenance: 3.8, management: 3.9 },
      reviews: [
        { author: "Current Resident", rating: 4, landlordRating: 4, date: "2026-06-01", text: "Cheapest rent I found near Provo with decent quality. Same company as Canyon View, and they've been consistent." },
        { author: "Former Resident", rating: 3, landlordRating: 3, date: "2026-03-10", text: "It's fine for the price. Walls are thin, you'll hear your neighbors." }
      ]
    },
    {
      id: "cedar-hollow",
      name: "Cedar Hollow",
      landlordId: "nest-living",
      address: "1500 W 300 S, Provo, UT 84601",
      lat: 40.2505, lng: -111.6600,
      price: "$410–$560/mo",
      priceMin: 410,
      beds: "1–4 bed",
      subRatings: { location: 3.2, value: 3.7, maintenance: 2.8, management: 2.5 },
      reviews: [
        { author: "Current Resident", rating: 2, landlordRating: 2, date: "2026-05-25", text: "Same management as The Nest on 9th and we've had similar issues getting maintenance to show up." },
        { author: "Current Resident", rating: 3, landlordRating: 2, date: "2026-04-14", text: "Apartment itself is okay. Just don't expect a quick response if something breaks." },
        { author: "Former Resident", rating: 2, landlordRating: 1, date: "2026-01-08", text: "Took over two months and a certified letter to get our deposit back after we moved out." }
      ]
    }
  ]
};
