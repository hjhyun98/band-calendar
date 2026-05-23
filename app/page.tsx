"use client";

import { loadBindings } from "next/dist/build/swc";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { start } from "repl";

const times = ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "24:00"];

// type Schedule ={
//   startIndex: number;
//   endIndex: number | null;
// };

  type Schedule ={
    selectedIndexes: number[];
  };

export default function Home(){
  
  useEffect(()=> {
    const savedData = localStorage.getItem("schedules");

    if (!savedData) return;

    const schedules: Record<string, Schedule> = JSON.parse(savedData);
    setSavedDateKeys(Object.keys(schedules));
  }, []);
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);

  const [savedDateKeys, setSavedDateKeys] =useState<string[]>([]);
  const [saveMessage, setSaveMessage] = useState("");

  const formatDate = (date: Date) => {
    const weekday = date.toLocaleDateString("en-US", {
      weekday:"short",
    });

    return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()} ${weekday}`;
  }

  const getTimeLabel = (time:string) => {
    return time.split(":")[0];
  };

  // const [startIndex, setStartIndex] = useState<number | null>(null);
  // const [endIndex, setEndIndex] = useState<number | null>(null);

  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [rangeStartIndex, setRangeStartIndex] = useState<number | null>(null);

  // const handleTimeClick = (clickedIndex: number) => {
    
  //   console.log("you clicked: ",clickedIndex);
   
  //   if (startIndex === null) {
  //     setStartIndex(clickedIndex);
  //     return;
  //   }

  //   if (endIndex !== null){
  //     if(clickedIndex === endIndex){
  //       setStartIndex(null);
  //       setEndIndex(null);
  //       return;
  //     }

  //     if(clickedIndex > startIndex){
  //       setEndIndex(clickedIndex);
  //       return;
  //     }

  //     setStartIndex(clickedIndex);
  //     setEndIndex(null);
  //     return;
  //   }

  //   if(clickedIndex === startIndex){
  //     setStartIndex(null);
  //     setEndIndex(null);
  //     return;
  //   }
    
  //   if (clickedIndex < startIndex){
  //     setStartIndex(clickedIndex);
  //     setEndIndex(null);
  //     return;
  //   }
    
  //   if (clickedIndex >= startIndex){
  //     setEndIndex(clickedIndex);
  //     return;
  //   }

    
  // }

  const handleTimeClick = (clickedIndex: number) =>{
    if(selectedIndexes.includes(clickedIndex)){
      setSelectedIndexes(
        selectedIndexes.filter((index) => index !== clickedIndex)
      );
      return;
    }

    if(rangeStartIndex === null){
      setRangeStartIndex(clickedIndex);
      return;
    }

    if(clickedIndex === rangeStartIndex) {
      setRangeStartIndex(null);
      return;
    }

    const start = Math.min(rangeStartIndex, clickedIndex);
    const end = Math.max(rangeStartIndex, clickedIndex);

    const range = Array.from(
      {length: end - start + 1},
      (_, i) => start + i
    );

    setSelectedIndexes((prev) =>
      Array.from(new Set([...prev, ...range])).sort((a,b) => a - b)
    );

    setRangeStartIndex(null);
  };

  const handleSave = () => {
    if(!selectedDate || selectedIndexes === null) return;

    const dateKey = formatDate(selectedDate);

    const savedData = localStorage.getItem("schedules");

    const schedules: Record<string, Schedule> = savedData
      ? JSON.parse(savedData)
      : {};

      // schedules[dateKey] = {
      //   startIndex,
      //   endIndex,
      // };

      schedules[dateKey] = {
        selectedIndexes,
      };

      localStorage.setItem("schedules", JSON.stringify(schedules));
      setSavedDateKeys(Object.keys(schedules));

      setSaveMessage("saved");

      setTimeout(() => {
        setSaveMessage("");
      }, 2000);
  };

  const handleReset = () => {
    if (!selectedDate) return;

    const dateKey = formatDate(selectedDate);
    const savedData = localStorage.getItem("schedules");

    if (!savedData) return;

    const schedules: Record<string, Schedule> = JSON.parse(savedData);

    delete schedules[dateKey];

    localStorage.setItem("schedules", JSON.stringify(schedules));
    setSavedDateKeys(Object.keys(schedules));

    // setStartIndex(null);
    // setEndIndex(null);

    setSelectedIndexes([]);
    setRangeStartIndex(null);

    console.log("삭제완료:",schedules);
  };

  // const selectedTimeText = 
  //   startIndex === null
  //   ? "-"
  //   : endIndex === null
  //     ? `${times[startIndex]} ~ ?`
  //     : `${times[startIndex]} ~ ${times[endIndex+1]}`;

  const formatSelectedTimeText = (indexes: number[]) => {
    if(indexes.length === 0) return "-";

    const sortedIndexes = [...indexes].sort((a,b) => a - b);
    
    const ranges: string[] = [];

    let rangeStart = sortedIndexes[0];
    let rangeEnd = sortedIndexes[0];

    for(let i = 1; i < sortedIndexes.length; i++){
      const currentIndex = sortedIndexes[i];

      if(currentIndex === rangeEnd + 1){
        rangeEnd = currentIndex;
      } else {
        ranges.push(`${times[rangeStart]} ~ ${times[rangeEnd+1]}`);
        
        rangeStart = currentIndex;
        rangeEnd = currentIndex;
      }
    }

    ranges.push(`${times[rangeStart]} ~ ${times[rangeEnd+1]}`);

    return ranges.join(",");
  };

  const selectedTimeText = formatSelectedTimeText(selectedIndexes);
  
  return (
    <main className="bg-white min-h-screen text-black p-8">
      {saveMessage && (
            <div
              className="
                fixed top-6 left-1/2 -translate-x-1/2 z-50
                min-w-[280px]
                rounded-2xl
                border border-white/40
                bg-white/20
                px-6 py-4
                text-center text-base font-medium text-gray-700
                shadow-2xl
                backdrop-blur-lg
              ">
                {saveMessage}
              </div>
          )}
      <h1>Band Calendar</h1>

      <Calendar
        onChange={(date) => {
          const clickedDate = date as Date;
          setSelectedDate(clickedDate);

          const dateKey = formatDate(clickedDate);
          const savedData = localStorage.getItem("schedules");

          // if(!savedData) {
          //   setStartIndex(null);
          //   setEndIndex(null);
          //   return;
          // }

          if(!savedData){
            setSelectedIndexes([]);
            setRangeStartIndex(null);
            return;
          }

          const schedules: Record<string, Schedule> = JSON.parse(savedData);
          const savedSchedule = schedules[dateKey];
        
          if(savedSchedule){
            setSelectedIndexes(savedSchedule.selectedIndexes);
            setRangeStartIndex(null);
          } else {
            setSelectedIndexes([]);
            setRangeStartIndex(null);
          }

          // if (savedSchedule) {
          //   setStartIndex(savedSchedule.startIndex);
          //   setEndIndex(savedSchedule.endIndex);
          // } else {
          //   setStartIndex(null);
          //   setEndIndex(null);
          // }
        }
      }
        value={selectedDate}
        minDate={new Date()}
        maxDate={maxDate}
        tileClassName={({ date }) => {
          const dateKey = formatDate(date);

          return savedDateKeys.includes(dateKey) ? "saved-date" : null;
        }}
      />

      <div>
        selected date:
        {selectedDate && (
          <span> {formatDate(selectedDate)}</span>
        )}
      </div>

      {selectedDate && (
        <div>
          <div className="mt-4 mb-4 flex items-center gap-3">
          <p>
            선택 시간: {selectedTimeText}
          </p>

          <button
            disabled={!selectedDate}
            onClick={handleReset}
            className="ml-auto px-4 py-2 rounded bg-gray-200 text-black"
          >reset</button>

          <button
            // disabled={startIndex === null}
            disabled={selectedIndexes.length === 0}
            onClick={handleSave}
            className={`
              ml-2 px-4 py-2 rounded
              ${
                // startIndex === null
                selectedIndexes.length === 0
                  ? "bg-gray-300 text-gray-500"
                  : "bg-blue-500 text-white"
              }`}
          >save</button>
        </div>
          
          <div className="grid grid-cols-4 gap-4">
            {times.slice(0,-1).map((time, index) => {
              // const isSelected = 
              // startIndex !== null &&
              // (
              //   endIndex === null
              //   ? index === startIndex
              //   : index >= startIndex && index <= endIndex
              // );
              const isSelected = 
                selectedIndexes.includes(index) || rangeStartIndex === index;
              return(
                <button 
                key={time}
                onClick={() => handleTimeClick(index)}
                className={`
                  px-4 py-2 rounded border
                  ${
                    isSelected
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-black"
                  }
                  `}
                >
                {getTimeLabel(time)}
              </button>
              )
            })}
          </div>
        </div>
        
      )}
    
    </main>
  );
}