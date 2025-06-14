"use client";
import React, { useEffect, useState } from "react";
import SupabaseService from "@/app/service/supabase";
import BarChartByTime from "./graph";
import WinRateLineChart from "./winrate";
type betdata = {
  date: string;
  res: number;
  bet: number;
};
type RawData = {
  created_at: string;
  Res: number;
  bet: number;
};
const Page = () => {
  const [mybet,setMybet] = useState<number>();
  const [result,setResult] = useState<number>();
  const [data, setData] = useState<betdata[]>([]);
  const supabase = SupabaseService.getClient();
  useEffect(()=>{
    if(mybet !== undefined) console.log(mybet);
    if(result !== undefined) console.log(result);
    if(mybet !== undefined && result !== undefined){
        handleBet(mybet).then(()=>setMybet(undefined)).then(()=>setResult(undefined)).then(()=>{console.log('clear')})
    }
  },[mybet,result])
  const handleBet = async (bet: number) => {
    const { error } = await supabase.from("betdata").insert({
      Res: mybet,
      bet: result
    });
    if (error) {
      console.log(error);
    }
    const map: betdata = {
      date: new Date().toISOString(), // ← เก็บเป็น ISO สำหรับ sort ที่แม่นยำ
      res: bet,
      bet: result!
    };
    const map2 = [...data, map];

    setData(
      map2.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ) // sort ก่อน
    );
    console.log("success update");
  };
  useEffect(() => {
    console.log(data);
  }, [data]);
  const fetchData = async () => {
  const pageSize = 1000;
  const maxRows = 5000; // กำหนดว่าจะดึงได้สูงสุดกี่แถว
  const allData: RawData[] = [];

  for (let i = 0; i < Math.ceil(maxRows / pageSize); i++) {
    const from = i * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from("betdata")
      .select("*")
      .range(from, to);

    if (error) {
      console.error("Error loading data from", from, "to", to, error);
      break;
    }

    if (data && data.length > 0) {
      allData.push(...data);
      if (data.length < pageSize) break; // แสดงว่าข้อมูลหมดแล้ว
    } else {
      break;
    }
  }

  // Sort data ตาม created_at
  const sortedData = allData.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Map ให้อยู่ในรูปแบบ betdata[]
  const mapdata: betdata[] = sortedData.map((item) => ({
    date: item.created_at, // ISO string
    res: item.Res,
    bet: item.bet,
  }));

  setData(mapdata);
};

useEffect(() => {
  fetchData();
}, []);
const chaneword= (bet:number)=>{
    switch(bet){
        case 0: return 'Tie';
        case 1: return 'Player';
        case -1: return 'Banker';
    }
    
}
function calculateWinrate(data: betdata[]) {
  let total = 0;
  let wins = 0;

  data.forEach(({ res, bet }) => {
    if (bet !== 0) { // ข้ามกรณี tie
      total++;
      if (res === bet) {
        wins++;
      }
    }
  });

  return total > 0 ? parseFloat(((wins / total) * 100).toFixed(2)) : 0;
}
  return (
    <div className="w-full h-full">
      <div className="flex flex-col md:flex-row gap-5 w-full justify-center">
        <div className="">
            <div>Mybet</div>
        <div className="flex">
            <div
          className="h-40 w-40 bg-blue-600 hover:bg-blue-700 cursor-pointer"
          onClick={() => setMybet(1)}
        ></div>
        <div
          className="h-40 w-40 bg-green-500 hover:bg-green-600 cursor-pointer"
          onClick={() => setMybet(0)}
        ></div>
        <div
          className="h-40 w-40 bg-red-500 hover:bg-red-600 cursor-pointer"
          onClick={() => setMybet(-1)}
        ></div>
        </div>
      </div>
      <div className="">
        <div>Result</div>
        <div className="flex">
            <div
          className="h-40 w-40 bg-blue-600 hover:bg-blue-700 cursor-pointer"
          onClick={() => setResult(1)}
        ></div>
        <div
          className="h-40 w-40 bg-green-500 hover:bg-green-600 cursor-pointer"
          onClick={() => setResult(0)}
        ></div>
        <div
          className="h-40 w-40 bg-red-500 hover:bg-red-600 cursor-pointer"
          onClick={() => setResult(-1)}
        ></div>
        </div>
      </div>
      </div>
      {mybet &&  <div>you bet {chaneword(mybet)}</div>}
      
        <BarChartByTime data={data}/>
        <WinRateLineChart data={data}/>
        <div className="flex gap-5 w-full grid-cols-2">
          <div className="border-1  h-30 w-full rounded p-3">
          <div className="pb-2">TotalRound</div>
          <div className=" h-full text-3xl flex justify-center">{data.length}</div>
        </div>
        <div className="border-1  h-30 w-full rounded p-3">
          <div className="pb-2">TotalWinrate</div>
          <div className=" h-full text-3xl flex justify-center">{calculateWinrate(data)} %</div>
        </div>
        <div className="border-1  h-30 w-full rounded p-3">
          <div className="pb-2">HourSpend</div>
          <div className=" h-full text-3xl flex justify-center">{(((data.length)/2)/60).toFixed(2)} Hr</div>
        </div>
        </div>
        {data.map((item, i) => (
          <div key={i}>
            {new Date(item.date).toLocaleString("th-TH", {
              timeZone: "Asia/Bangkok",
              dateStyle: "medium",
              timeStyle: "short",
            })}
            |{chaneword(item.res)}|{chaneword(item.bet)}|{item.res === item.bet?'win':'lose'}
          </div>
        ))}
    </div>
  );
};

export default Page;
