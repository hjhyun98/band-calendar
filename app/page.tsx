"use client";

import {useState} from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { start } from "repl";

const times = ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "24:00"];

export default function Home(){
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);

  const formatDate = (date: Date) => {
    const weekday = date.toLocaleDateString("en-US", {
      weekday:"short",
    });

    return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()} ${weekday}`;
  }

  const getTimeLabel = (time:string) => {
    return time.split(":")[0];
  };

  const [startIndex, setStartIndex] = useState<number | null>(null);
  const [endIndex, setEndIndex] = useState<number | null>(null);

  const handleTimeClick = (clickedIndex: number) => {
    
    console.log("you clicked: ",clickedIndex);
   
    if (startIndex === null) {
      setStartIndex(clickedIndex);
      return;
    }

    if (endIndex !== null){
      if(clickedIndex === endIndex){
        setStartIndex(null);
        setEndIndex(null);
        return;
      }

      if(clickedIndex > startIndex){
        setEndIndex(clickedIndex);
        return;
      }

      setStartIndex(clickedIndex);
      setEndIndex(null);
      return;
    }

    if(clickedIndex === startIndex){
      setStartIndex(null);
      setEndIndex(null);
      return;
    }
    
    if (clickedIndex < startIndex){
      setStartIndex(clickedIndex);
      setEndIndex(null);
      return;
    }
    
    if (clickedIndex >= startIndex){
      setEndIndex(clickedIndex);
      return;
    }

    
  }

  const selectedTimeText = 
    startIndex === null
    ? "-"
    : endIndex === null
      ? `${times[startIndex]} ~ ?`
      : `${times[startIndex]} ~ ${times[endIndex+1]}`;

  return (
    <main className="bg-white min-h-screen text-black p-8">
      <h1>Band Calendar</h1>

      <Calendar
        onChange={(date) => {
          setSelectedDate(date as Date)
          setStartIndex(null);
          setEndIndex(null);
        }}
        value={selectedDate}
        minDate={new Date()}
        maxDate={maxDate}
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
            disabled={startIndex === null}
            onClick={() => {
              console.log("저장할 데이터:", {
                date: selectedDate,
                startIndex,
                endIndex,
                startTime: startIndex !== null ? times[startIndex] : null,
                endTime: endIndex !== null ? times[endIndex+1] : null,
              });
            }}
            className={`
              ml-auto px-4 py-2 rounded
              ${
                startIndex === null
                  ? "bg-gray-300 text-gray-500"
                  : "bg-blue-500 text-white"
              }`}
          >
            저장
          </button>
        </div>

          <div className="grid grid-cols-4 gap-4">
            {times.slice(0,-1).map((time, index) => {
              const isSelected = 
              startIndex !== null &&
              (
                endIndex === null
                ? index === startIndex
                : index >= startIndex && index <= endIndex
              );
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