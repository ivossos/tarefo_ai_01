import { useState } from "react";
import { Event } from "@shared/schema";
import { getTimeSlots, formatDate } from "@/lib/utils/date";
import TimeSlot from "./TimeSlot";
import AddEventModal from "./AddEventModal";

type DayViewProps = {
  date: Date;
  events: Event[];
  userId: number;
};

export default function DayView({ date, events, userId }: DayViewProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  
  const timeSlots = getTimeSlots();
  
  const handleAddEvent = (hour: number) => {
    setSelectedHour(hour);
    setIsAddModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setSelectedHour(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-3 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="font-medium">{formatDate(date)}</h3>
          <button className="text-neutral-500 hover:text-neutral-700">
            <i className="ri-more-2-fill"></i>
          </button>
        </div>
        
        {timeSlots.map((slot) => (
          <TimeSlot 
            key={slot.hour}
            time={slot.time}
            hour={slot.hour} 
            events={events}
            onAddEvent={handleAddEvent}
          />
        ))}
      </div>
      
      <AddEventModal 
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        defaultDate={date}
        defaultHour={selectedHour}
        userId={userId}
      />
    </>
  );
}
