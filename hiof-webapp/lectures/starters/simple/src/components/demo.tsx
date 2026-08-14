"use client";

const Demo = ({ ctx }) => {
  const handleClick = () => {
    console.log("Button clicked!", ctx);
  };
  return (
    <div>
      Demo {JSON.stringify(ctx)} <button onClick={handleClick}>Click me</button>
    </div>
  );
};

export default Demo;
