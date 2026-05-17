"use client";

import { loadBindings } from "next/dist/build/swc";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { start } from "repl";

const times = ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "24:00"];

type Schedule ={
  startIndex: number;
  endIndex: number | null;
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

  const handleSave = () => {
    if(!selectedDate || startIndex === null) return;

    const dateKey = formatDate(selectedDate);

    const savedData = localStorage.getItem("schedules");

    const schedules: Record<string, Schedule> = savedData
      ? JSON.parse(savedData)
      : {};

      schedules[dateKey] = {
        startIndex,
        endIndex,
      };

      localStorage.setItem("schedules", JSON.stringify(schedules));
      setSavedDateKeys(Object.keys(schedules));

      console.log("저장완료:", schedules);
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

    setStartIndex(null);
    setEndIndex(null);

    console.log("삭제완료:",schedules);
  };

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
          const clickedDate = date as Date;
          setSelectedDate(clickedDate);

          const dateKey = formatDate(clickedDate);
          const savedData = localStorage.getItem("schedules");

          if(!savedData) {
            setStartIndex(null);
            setEndIndex(null);
            return;
          }

          const schedules: Record<string, Schedule> = JSON.parse(savedData);
          const savedSchedule = schedules[dateKey];
        
          if (savedSchedule) {
            setStartIndex(savedSchedule.startIndex);
            setEndIndex(savedSchedule.endIndex);
          } else {
            setStartIndex(null);
            setEndIndex(null);
          }
        }
      }
        value={selectedDate}
        minDate={new Date()}
        maxDate={maxDate}
        tileClassName={({date}) => {
          const dateKey = formatDate(date);

          if(savedDateKeys.includes(dateKey)){
            return "saved-date";
          }

          return null;
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
            disabled={startIndex === null}
            onClick={handleSave}
            className={`
              ml-2 px-4 py-2 rounded
              ${
                startIndex === null
                  ? "bg-gray-300 text-gray-500"
                  : "bg-blue-500 text-white"
              }`}
          >save</button>
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