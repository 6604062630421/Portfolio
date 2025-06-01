import { FC } from "react";
import Masonry from "react-masonry-css";
import { Cover } from "../type";
type masonryType = {
    Itempic:Cover[];
}
const MyMasonryGrid:FC<masonryType> = ({Itempic}) => {
  return (
    <Masonry
      breakpointCols={{
        default:3,
        640:1
      }}
      className="flex w-auto -ml-2"
      columnClassName="pl-2"
    >
      {Itempic.map((src, i) => (
        <div key={i} className="mb-2 bg-white overflow-hidden shadow">
          <img src={src.pic} className="w-full h-auto object-cover" />
        </div>
      ))}
    </Masonry>
  );
};
export default MyMasonryGrid;
