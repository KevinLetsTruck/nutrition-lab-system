"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  Plus,
  Trash2,
  Calendar,
  Bell,
  Sun,
  Moon,
  Utensils,
  Coffee,
  Save,
  RotateCcw,
  Info,
} from "lucide-react";
import { toast } from "sonner";

// Daily schedule interface
export interface DailySchedule {
  [key: string]: string | undefined;
  description?: string;
  notes?: string;
}

// Schedule template interface
interface ScheduleTemplate {
  id: string;
  name: string;
  scheduleTimes: DailySchedule;
  isDefault: boolean;
}

// Preset schedule templates (matching our database seed data)
const PRESET_TEMPLATES: ScheduleTemplate[] = [
  {
    id: "standard",
    name: "Standard Schedule (2x daily)",
    scheduleTimes: {
      morning: "8:00 AM",
      evening: "6:00 PM",
      description: "Standard morning and evening routine",
    },
    isDefault: true,
  },
  {
    id: "intensive",
    name: "Intensive Schedule (3x daily)",
    scheduleTimes: {
      morning: "8:00 AM",
      lunch: "12:00 PM",
      evening: "6:00 PM",
      description: "Three times daily for intensive protocols",
    },
    isDefault: false,
  },
  {
    id: "gentle",
    name: "Gentle Schedule (1x daily)",
    scheduleTimes: {
      morning: "8:00 AM",
      description: "Once daily for sensitive patients",
    },
    isDefault: false,
  },
  {
    id: "digestive",
    name: "Custom Digestive Schedule",
    scheduleTimes: {
      wake_up: "7:00 AM",
      before_breakfast: "7:30 AM",
      after_breakfast: "9:00 AM",
      before_lunch: "11:30 AM",
      after_lunch: "1:00 PM",
      before_dinner: "5:30 PM",
      after_dinner: "7:00 PM",
      bedtime: "10:00 PM",
      description: "Comprehensive digestive support schedule",
    },
    isDefault: false,
  },
];

// Common time slot suggestions
const TIME_SLOT_SUGGESTIONS = [
  { key: "wake_up", label: "Wake Up", icon: Sun, defaultTime: "7:00 AM" },
  { key: "morning", label: "Morning", icon: Coffee, defaultTime: "8:00 AM" },
  { key: "before_breakfast", label: "Before Breakfast", icon: Utensils, defaultTime: "7:30 AM" },
  { key: "after_breakfast", label: "After Breakfast", icon: Utensils, defaultTime: "9:00 AM" },
  { key: "mid_morning", label: "Mid Morning", icon: Clock, defaultTime: "10:30 AM" },
  { key: "before_lunch", label: "Before Lunch", icon: Utensils, defaultTime: "11:30 AM" },
  { key: "lunch", label: "Lunch", icon: Utensils, defaultTime: "12:00 PM" },
  { key: "after_lunch", label: "After Lunch", icon: Utensils, defaultTime: "1:00 PM" },
  { key: "afternoon", label: "Afternoon", icon: Clock, defaultTime: "3:00 PM" },
  { key: "before_dinner", label: "Before Dinner", icon: Utensils, defaultTime: "5:30 PM" },
  { key: "evening", label: "Evening", icon: Clock, defaultTime: "6:00 PM" },
  { key: "after_dinner", label: "After Dinner", icon: Utensils, defaultTime: "7:00 PM" },
  { key: "bedtime", label: "Bedtime", icon: Moon, defaultTime: "10:00 PM" },
];

interface DailyScheduleBuilderProps {
  schedule: DailySchedule;
  onChange: (schedule: DailySchedule) => void;
  className?: string;
}

interface TimeSlot {
  key: string;
  label: string;
  time: string;
  isCustom: boolean;
}

export function DailyScheduleBuilder({
  schedule,
  onChange,
  className,
}: DailyScheduleBuilderProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [newSlotKey, setNewSlotKey] = useState("");
  const [newSlotLabel, setNewSlotLabel] = useState("");
  const [newSlotTime, setNewSlotTime] = useState("");
  const [description, setDescription] = useState(schedule.description || "");
  const [notes, setNotes] = useState(schedule.notes || "");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize time slots from schedule
  useEffect(() => {
    const slots: TimeSlot[] = [];
    
    Object.entries(schedule).forEach(([key, value]) => {
      if (key !== "description" && key !== "notes" && value) {
        const suggestion = TIME_SLOT_SUGGESTIONS.find(s => s.key === key);
        slots.push({
          key,
          label: suggestion?.label || formatSlotLabel(key),
          time: value,
          isCustom: !suggestion,
        });
      }
    });

    // Sort by time
    slots.sort((a, b) => {
      const timeA = convertTo24Hour(a.time);
      const timeB = convertTo24Hour(b.time);
      return timeA.localeCompare(timeB);
    });

    setTimeSlots(slots);
  }, [schedule]);

  // Convert time to 24-hour format for sorting
  const convertTo24Hour = (timeStr: string): string => {
    const [time, period] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");
    
    if (period?.toUpperCase() === "PM" && hours !== "12") {
      hours = (parseInt(hours) + 12).toString();
    } else if (period?.toUpperCase() === "AM" && hours === "12") {
      hours = "0";
    }
    
    return `${hours.padStart(2, "0")}:${minutes || "00"}`;
  };

  // Format slot label from key
  const formatSlotLabel = (key: string): string => {
    return key
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    const template = PRESET_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      onChange(template.scheduleTimes);
      setDescription(template.scheduleTimes.description || "");
      setHasUnsavedChanges(true);
      toast.success("Template applied", {
        description: `${template.name} has been loaded`,
      });
    }
  };

  // Handle time slot change
  const handleTimeSlotChange = (key: string, newTime: string) => {
    const updatedSchedule = { ...schedule };
    updatedSchedule[key] = newTime;
    onChange(updatedSchedule);
    setHasUnsavedChanges(true);
  };

  // Add new time slot
  const handleAddTimeSlot = () => {
    if (!newSlotKey || !newSlotLabel || !newSlotTime) {
      toast.error("Missing information", {
        description: "Please fill in all fields for the new time slot",
      });
      return;
    }

    if (schedule[newSlotKey]) {
      toast.error("Duplicate key", {
        description: "A time slot with this key already exists",
      });
      return;
    }

    const updatedSchedule = { ...schedule };
    updatedSchedule[newSlotKey] = newSlotTime;
    onChange(updatedSchedule);
    
    // Clear form
    setNewSlotKey("");
    setNewSlotLabel("");
    setNewSlotTime("");
    setHasUnsavedChanges(true);

    toast.success("Time slot added", {
      description: `${newSlotLabel} at ${newSlotTime}`,
    });
  };

  // Remove time slot
  const handleRemoveTimeSlot = (key: string) => {
    const updatedSchedule = { ...schedule };
    delete updatedSchedule[key];
    onChange(updatedSchedule);
    setHasUnsavedChanges(true);

    toast.success("Time slot removed");
  };

  // Handle description change
  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription);
    const updatedSchedule = { ...schedule };
    updatedSchedule.description = newDescription;
    onChange(updatedSchedule);
    setHasUnsavedChanges(true);
  };

  // Handle notes change
  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    const updatedSchedule = { ...schedule };
    updatedSchedule.notes = newNotes;
    onChange(updatedSchedule);
    setHasUnsavedChanges(true);
  };

  // Add suggested time slot
  const handleAddSuggestedSlot = (suggestion: typeof TIME_SLOT_SUGGESTIONS[0]) => {
    if (schedule[suggestion.key]) {
      toast.error("Already exists", {
        description: `${suggestion.label} is already in your schedule`,
      });
      return;
    }

    const updatedSchedule = { ...schedule };
    updatedSchedule[suggestion.key] = suggestion.defaultTime;
    onChange(updatedSchedule);
    setHasUnsavedChanges(true);

    toast.success("Time slot added", {
      description: `${suggestion.label} at ${suggestion.defaultTime}`,
    });
  };

  // Reset schedule
  const handleReset = () => {
    const emptySchedule: DailySchedule = {
      morning: "8:00 AM",
      evening: "6:00 PM",
      description: "Standard morning and evening routine",
    };
    onChange(emptySchedule);
    setSelectedTemplate("standard");
    setHasUnsavedChanges(false);

    toast.success("Schedule reset to default");
  };

  // Get icon for time slot
  const getIconForSlot = (key: string) => {
    const suggestion = TIME_SLOT_SUGGESTIONS.find(s => s.key === key);
    return suggestion?.icon || Clock;
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Daily Schedule
            </h3>
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Unsaved Changes
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Schedule Templates
            </CardTitle>
            <CardDescription>
              Start with a preset template or build a custom schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent>
                {PRESET_TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{template.name}</span>
                      {template.isDefault && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Current Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Slots ({timeSlots.length})
            </CardTitle>
            <CardDescription>
              Configure when supplements should be taken throughout the day
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeSlots.length === 0 ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No time slots configured. Select a template above or add custom time slots below.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {timeSlots.map((slot) => {
                  const Icon = getIconForSlot(slot.key);
                  return (
                    <div
                      key={slot.key}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <Icon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <div className="flex-1">
                        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {slot.label}
                        </Label>
                      </div>
                      <Input
                        type="time"
                        value={convertTo24Hour(slot.time).replace(" AM", "").replace(" PM", "")}
                        onChange={(e) => {
                          const time24 = e.target.value;
                          const [hours, minutes] = time24.split(":");
                          const hour12 = parseInt(hours) > 12 
                            ? `${parseInt(hours) - 12}:${minutes} PM`
                            : parseInt(hours) === 0
                            ? `12:${minutes} AM`
                            : parseInt(hours) === 12
                            ? `12:${minutes} PM`
                            : `${hours}:${minutes} AM`;
                          handleTimeSlotChange(slot.key, hour12);
                        }}
                        className="w-32"
                      />
                      {slot.isCustom && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTimeSlot(slot.key)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Add Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Quick Add
            </CardTitle>
            <CardDescription>
              Common time slots you can add to your schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {TIME_SLOT_SUGGESTIONS
                .filter(suggestion => !schedule[suggestion.key])
                .map((suggestion) => {
                  const Icon = suggestion.icon;
                  return (
                    <Button
                      key={suggestion.key}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSuggestedSlot(suggestion)}
                      className="justify-start gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {suggestion.label}
                    </Button>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Add Custom Time Slot */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Custom Time Slot
            </CardTitle>
            <CardDescription>
              Create a custom time slot for specific supplement timing needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="slot-key" className="text-gray-900 font-medium dark:text-gray-100">
                  Key
                </Label>
                <Input
                  id="slot-key"
                  value={newSlotKey}
                  onChange={(e) => setNewSlotKey(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                  placeholder="e.g., mid_afternoon"
                />
              </div>
              <div>
                <Label htmlFor="slot-label" className="text-gray-900 font-medium dark:text-gray-100">
                  Label
                </Label>
                <Input
                  id="slot-label"
                  value={newSlotLabel}
                  onChange={(e) => setNewSlotLabel(e.target.value)}
                  placeholder="e.g., Mid Afternoon"
                />
              </div>
              <div>
                <Label htmlFor="slot-time" className="text-gray-900 font-medium dark:text-gray-100">
                  Time
                </Label>
                <Input
                  id="slot-time"
                  value={newSlotTime}
                  onChange={(e) => setNewSlotTime(e.target.value)}
                  placeholder="e.g., 3:00 PM"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleAddTimeSlot}
                  disabled={!newSlotKey || !newSlotLabel || !newSlotTime}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Description */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="description" className="text-gray-900 font-medium dark:text-gray-100">
              Schedule Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Brief description of this schedule"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="notes" className="text-gray-900 font-medium dark:text-gray-100">
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Any special instructions or notes about timing..."
              className="mt-2 min-h-[80px]"
            />
          </div>
        </div>

        {/* Schedule Preview */}
        {timeSlots.length > 0 && (
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Daily Schedule Preview:</p>
                <div className="text-sm">
                  {timeSlots.map((slot, index) => (
                    <span key={slot.key}>
                      {slot.time}
                      {index < timeSlots.length - 1 && " • "}
                    </span>
                  ))}
                </div>
                {description && (
                  <p className="text-sm italic">{description}</p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
