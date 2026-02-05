import { Link } from "react-router-dom";

export default function RunningCard({ title, image, type }) {
  return (
    <Link to={`/recommendation?type=${type}`}>
      <div className="relative rounded-xl overflow-hidden shadow-lg hover:scale-105 transition cursor-pointer">
        <img src={image} className="w-full h-48 object-cover" />

        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <h2 className="text-white text-2xl font-bold">
            {title}
          </h2>
        </div>
      </div>
    </Link>
  );
}