import { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useApp } from '../../context/AppContext';
import { availabilityAPI } from '../../services/api';
import { Clock, Save, Check } from 'lucide-react';
import { formatTimeTo12h } from '../../utils/timeUtils';

const DAYS = [
  { id: 0, label: 'Sunday' },
  { id: 1, label: 'Monday' },
  { id: 2, label: 'Tuesday' },
  { id: 3, label: 'Wednesday' },
  { id: 4, label: 'Thursday' },
  { id: 5, label: 'Friday' },
  { id: 6, label: 'Saturday' }
];

const DEFAULT_SLOTS = [
  '09:00', '10:00', '11:00', '12:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

export default function CounsellorAvailability() {
  const { user } = useApp();
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5]);
  const [timeSlots, setTimeSlots] = useState(DEFAULT_SLOTS);

  useEffect(() => {
    if (user?._id && user.role === 'counsellor') {
      fetchAvailability();
    }
  }, [user]);

  const fetchAvailability = async () => {
    try {
      const { data } = await availabilityAPI.get(user._id);
      setAvailability(data);
      setSelectedDays(data.daysOfWeek || [1, 2, 3, 4, 5]);
      setTimeSlots(data.timeSlots?.map(s => s.start) || DEFAULT_SLOTS);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (dayId) => {
    setSelectedDays(prev =>
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId].sort()
    );
    setSaved(false);
  };

  const toggleSlot = (slot) => {
    setTimeSlots(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot].sort()
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const slots = timeSlots.map(start => ({
        start,
        end: `${parseInt(start.split(':')[0]) + 1}:00`
      }));

      await availabilityAPI.update(user._id, {
        daysOfWeek: selectedDays,
        timeSlots: slots
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving availability:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
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
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Set Your Availability</h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Configure your working days and time slots for appointments
                </p>
              </div>
              <Button onClick={handleSave} disabled={saving || saved}>
                {saved ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Saved
                  </>
                ) : saving ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>

            <Card className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Working Days</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Select the days you're available for appointments
              </p>
              <div className="flex flex-wrap gap-3">
                {DAYS.map(day => (
                  <button
                    key={day.id}
                    onClick={() => toggleDay(day.id)}
                    className={`px-4 py-3 rounded-xl font-medium transition-all ${
                      selectedDays.includes(day.id)
                        ? 'bg-primary dark:bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {day.label.substring(0, 3)}
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Time Slots
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Select the time slots you have available for appointments
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {DEFAULT_SLOTS.map(slot => (
                  <button
                    key={slot}
                    onClick={() => toggleSlot(slot)}
                    className={`px-4 py-3 rounded-xl font-medium transition-all ${
                      timeSlots.includes(slot)
                        ? 'bg-accent text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {formatTimeTo12h(slot)}
                  </button>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <h4 className="font-medium text-gray-800 dark:text-white mb-2">Current Schedule Preview</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedDays.length > 0
                    ? `Available on ${selectedDays.map(d => DAYS.find(day => day.id === d)?.label).join(', ')}`
                    : 'No days selected'}
                </p>
                {selectedDays.length > 0 && timeSlots.length > 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Time slots: {timeSlots.sort().map(s => formatTimeTo12h(s)).join(', ')}
                  </p>
                )}
                {selectedDays.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">Please select at least one day</p>
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}


