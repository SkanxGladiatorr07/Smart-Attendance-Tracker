import TodayScheduleWidget from '../components/dashboard/TodayScheduleWidget';

export default function Attendance() {
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <TodayScheduleWidget interactiveAttendance={true} />
    </div>
  );
}
