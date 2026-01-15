import { useState } from "react";
import { Carousel, Image } from "react-bootstrap";
import {banners} from "../data/Banner";

function CarouselSlider() {
  // 🎲 Random slide khi load
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * banners.length)
  );

  return (
    <Carousel
      fade
      interval={3000}
      activeIndex={index}
      onSelect={(i) => setIndex(i)}
    >
      {banners.map((banner) => (
        <Carousel.Item key={banner.id}>
          <Image
            className="d-block w-100"
            src={banner.image}
            alt={banner.title}
            style={{ objectFit: "cover", maxHeight: "450px" }}
          />
          <Carousel.Caption
            style={{
              background: "rgba(0,0,0,0.4)",
              borderRadius: "10px",
              padding: "1rem",
            }}
          >
            <h3>{banner.title}</h3>
            <p>{banner.description}</p>
          </Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

export default CarouselSlider;
