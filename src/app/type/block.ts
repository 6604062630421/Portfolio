export type Blocktype = 
| "text"
| "heading"
| "img"
| "light-text"
| "link-box"
| "column"

export interface BaseBlock {
    id:string;
    type:Blocktype;
    position?:number;
}

export interface TextBlock extends BaseBlock{
    type:"text"|"light-text"|"heading"
    content:string;
    href?:string;
}
export interface ImgBlock extends BaseBlock{
    type:"img";
    content:string;
    alt?:string;
}
export interface LinkBox extends BaseBlock{
    type:'link-box'
    content:string;
    href:string;
}
export interface ColumnBox extends BaseBlock{
    type:'column';
    column:Block[];
    aspect?:number[];
}

export type Block =
|TextBlock
|ImgBlock
|LinkBox
|ColumnBox
