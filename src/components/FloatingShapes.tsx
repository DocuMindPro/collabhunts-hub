const FloatingShapes = () => {
  const shapes = [
    { size: 200, top: "10%", left: "5%", delay: 0, duration: 20 },
    { size: 150, top: "60%", left: "80%", delay: 2, duration: 25 },
    { size: 100, top: "30%", left: "70%", delay: 4, duration: 18 },
    { size: 180, top: "70%", left: "10%", delay: 1, duration: 22 },
    { size: 120, top: "20%", left: "40%", delay: 3, duration: 24 },
    { size: 80, top: "80%", left: "50%", delay: 5, duration: 19 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {shapes.map((shape, index) => (
        <div
          key={index}
          className="floating-shape absolute rounded-full"
          style={{
            width: shape.size,
            height: shape.size,
            top: shape.top,
            left: shape.left,
            animationDelay: `${shape.delay}s`,
            animationDuration: `${shape.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingShapes;
