const BrandMarquee = () => {
  // Placeholder brand names - can be replaced with real logos later
  const brands = [
    "TechCorp",
    "StyleHub",
    "FitLife",
    "GreenEats",
    "TravelX",
    "BeautyBox",
    "GameZone",
    "FoodieApp",
    "WellnessPlus",
    "StreamFlow",
    "UrbanWear",
    "PetPal",
  ];

  return (
    <section className="py-12 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Trusted by leading brands worldwide
        </p>
      </div>
      
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-muted/30 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-muted/30 to-transparent z-10 pointer-events-none" />
        
        {/* Scrolling container */}
        <div className="marquee-container">
          <div className="marquee-content">
            {/* First set of brands */}
            {brands.map((brand, index) => (
              <div
                key={`brand-1-${index}`}
                className="flex-shrink-0 mx-8 px-6 py-3 bg-card rounded-lg border border-border/50 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-lg font-heading font-semibold text-muted-foreground">
                  {brand}
                </span>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {brands.map((brand, index) => (
              <div
                key={`brand-2-${index}`}
                className="flex-shrink-0 mx-8 px-6 py-3 bg-card rounded-lg border border-border/50 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-lg font-heading font-semibold text-muted-foreground">
                  {brand}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandMarquee;
