import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

const skinTypes = ["Oily", "Dry", "Combination", "Normal", "Sensitive"];
const goalsList = ["Hydration", "Anti-aging", "Brightening", "Acne Control", "Even Tone"];

export default function Profile() {
  const [skinType, setSkinType] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const handleGoalChange = (goal: string) => {
    setGoals(goals.includes(goal) ? goals.filter(g => g !== goal) : [...goals, goal]);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhoto(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = () => {
    localStorage.setItem('skinProfile', JSON.stringify({ skinType, goals, photo }));
    setMessage("Profile updated!");
  };

  return (
    <div className="relative min-h-[80vh] flex flex-col justify-center items-center px-2 bg-gradient-to-br from-glow-rose to-glow-lavender">
      <Link href="/dashboard" className="absolute top-6 left-6 group">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/80 border border-glow-purple text-glow-purple shadow hover:bg-glow-lavender/30 hover:text-glow-pink transition">
          <ArrowLeft className="w-6 h-6" />
        </span>
      </Link>
      <h2 className="text-2xl md:text-3xl font-extrabold text-glow-purple mb-6 mt-8 text-center drop-shadow">Edit Your Profile</h2>
      {/* Profile Photo */}
      <div className="flex flex-col items-center gap-2 mb-6">
        <div className="glow-gradient rounded-full w-20 h-20 flex items-center justify-center overflow-hidden">
          {photo ? <img src={photo} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-white text-3xl">👤</span>}
        </div>
        <label className="relative inline-block cursor-pointer mt-2">
          <span className="text-glow-purple font-semibold px-4 py-1 rounded-lg border border-glow-lavender bg-white/70 shadow-sm hover:bg-glow-lavender/30 transition block text-center">Upload Photo</span>
          <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
        </label>
      </div>
      <form className="w-full max-w-md flex flex-col gap-6" onSubmit={e => { e.preventDefault(); handleSave(); }}>
        {/* Skin Type */}
        <div>
          <label className="block text-glow-pink font-semibold mb-1">Skin Type</label>
          <select value={skinType} onChange={e => setSkinType(e.target.value)} className="w-full border border-glow-lavender rounded-lg p-2 bg-white/80 focus:ring-2 focus:ring-glow-pink transition">
            <option value="">Select skin type</option>
            {skinTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        {/* Goals */}
        <div>
          <label className="block text-glow-pink font-semibold mb-1">Goals</label>
          <div className="flex flex-wrap gap-2">
            {goalsList.map(goal => (
              <button
                key={goal}
                type="button"
                className={`px-3 py-1 rounded-full border border-glow-purple text-glow-purple text-sm transition ${goals.includes(goal) ? 'bg-glow-purple text-white' : 'bg-white/70'}`}
                onClick={() => handleGoalChange(goal)}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>
        <Button className="w-full glow-gradient text-white font-semibold text-lg py-2 rounded-lg shadow hover:scale-105 transition mt-2">Save Profile</Button>
        {message && <div className="text-green-600 font-semibold mt-2 text-center">{message}</div>}
      </form>
    </div>
  );
} 