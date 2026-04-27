import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { appointmentAPI } from "../services/api";
import { Calendar, Clock, User } from "lucide-react";

export default function AppointmentsPage() {
  const { user, isCounsellor } = useApp();
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?._id) {
          setLoading(false);
          return;
        }

        if (isCounsellor) {
          const { data } = await appointmentAPI.getByCounsellor(user._id);
          setAppointments(data || []);
        } else {
          const [appointmentsRes, counsellorsRes] = await Promise.all([
            appointmentAPI.getByStudent(user._id),
            appointmentAPI.getCounsellors(),
          ]);
          setAppointments(appointmentsRes.data || []);
          setCounsellors(counsellorsRes.data || []);
        }
      } catch (error) {
        console.error("Failed to load appointments:", error);
        toast.error("Could not load appointments.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isCounsellor, toast, user?._id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8 flex items-center justify-center lg:ml-64">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 lg:ml-64">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Appointments
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {isCounsellor
                  ? "Manage your upcoming sessions."
                  : "View your scheduled sessions and available experts."}
              </p>
            </div>

            {!isCounsellor && (
              <Card
                title="Our Experts"
                subtitle="Available counsellors on platform"
              >
                {counsellors.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {counsellors.map((c) => (
                      <div
                        key={c._id}
                        className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      >
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {c.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {c.specialization || "Wellness Counsellor"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No experts available right now.
                  </p>
                )}
              </Card>
            )}

            <Card
              title="Your Sessions"
              subtitle="Most recent appointments first"
            >
              {appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div
                      key={apt._id}
                      className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {isCounsellor
                              ? apt.studentId?.name || "Student"
                              : apt.counsellorId?.name || "Counsellor"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Status: {apt.status || "pending"}
                          </p>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-3">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {apt.date
                              ? new Date(apt.date).toLocaleDateString()
                              : "TBD"}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {apt.timeSlot || "TBD"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No appointments found.
                  </p>
                  {!isCounsellor && (
                    <div className="mt-4">
                      <Button disabled icon={Calendar}>
                        Booking UI will appear here
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
