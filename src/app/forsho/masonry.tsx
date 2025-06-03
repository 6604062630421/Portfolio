import { FC } from "react";
import Masonry from "react-masonry-css";
import { Cover } from "../type";
import Link from "next/link";
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
          <Link href={`/forsho/${src.project.project}`}><img src={src.pic} alt={src.project.project} className="w-full h-auto object-cover" /></Link>
        </div>
      ))}
    </Masonry>
  );
};
export default MyMasonryGrid;
