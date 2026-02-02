import React, { useState } from "react";
import { Button } from "react-bootstrap";

function TestCount() {
  const [count, setCount] = useState(0);

  const handleCount = () => {
    setCount(count + 1);
  };

  return (
    <div className="text-center mt-4">
      <h3>Count: {count}</h3>

      <Button variant="primary" onClick={handleCount}>
        Tăng
      </Button>
    </div>
  );
}

export default TestCount;
