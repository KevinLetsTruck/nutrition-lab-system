'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Pill,
  Clock,
  Target,
  Star,
  CheckCircle2,
  AlertCircle,
  Plus,
  Grip,
} from 'lucide-react';
import { toast } from 'sonner';

// Supplement interface matching our database schema
export interface ProtocolSupplement {
  id?: string;
  productName: string;
  dosage: string;
  timing: string;
  purpose?: string;
  priority: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
}

interface SupplementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplement?: ProtocolSupplement;
  onSave: (supplement: ProtocolSupplement) => void;
  existingSupplements: ProtocolSupplement[];
  mode: 'add' | 'edit';
}

// Common supplement suggestions for auto-complete
const COMMON_SUPPLEMENTS = [
  'Probiotics',
  'Vitamin D3',
  'Magnesium Glycinate',
  'Omega-3 Fish Oil',
  'B-Complex',
  'Vitamin C',
  'Zinc',
  'Iron',
  'Calcium',
  'CoQ10',
  'L-Glutamine',
  'NAC (N-Acetyl Cysteine)',
  'Digestive Enzymes',
  'Ashwagandha',
  'Rhodiola Rosea',
  'Milk Thistle',
  'Curcumin',
  'Alpha Lipoic Acid',
  'Glutathione',
  'Activated Charcoal',
];

// Common timing options
const TIMING_OPTIONS = [
  'Morning on empty stomach',
  'Morning with breakfast',
  'Between meals',
  'With lunch',
  'Afternoon',
  'Evening with dinner',
  'Before bedtime',
  'As needed',
  'Twice daily with meals',
  'Three times daily',
  'As directed',
];

// Common purposes
const PURPOSE_OPTIONS = [
  'Digestive support',
  'Immune support',
  'Energy production',
  'Anti-inflammatory',
  'Detoxification',
  'Stress support',
  'Sleep support',
  'Cognitive support',
  'Cardiovascular support',
  'Hormonal balance',
  'Gut health',
  'Liver support',
  'Joint support',
  'Antioxidant support',
];

interface SupplementFormData {
  productName: string;
  dosage: string;
  timing: string;
  purpose: string;
  priority: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export function SupplementForm({
  open,
  onOpenChange,
  supplement,
  onSave,
  existingSupplements,
  mode,
}: SupplementFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [productSuggestions, setProductSuggestions] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SupplementFormData>({
    defaultValues: {
      productName: '',
      dosage: '',
      timing: '',
      purpose: '',
      priority: getNextPriority(),
      isActive: true,
      startDate: '',
      endDate: '',
    },
  });

  const watchedProductName = watch('productName');

  // Calculate next priority based on existing supplements
  function getNextPriority(): number {
    if (existingSupplements.length === 0) return 1;
    const maxPriority = Math.max(...existingSupplements.map(s => s.priority));
    return maxPriority + 1;
  }

  // Reset form when supplement changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      if (supplement && mode === 'edit') {
        reset({
          productName: supplement.productName,
          dosage: supplement.dosage,
          timing: supplement.timing,
          purpose: supplement.purpose || '',
          priority: supplement.priority,
          isActive: supplement.isActive,
          startDate: supplement.startDate
            ? new Date(supplement.startDate).toISOString().split('T')[0]
            : '',
          endDate: supplement.endDate
            ? new Date(supplement.endDate).toISOString().split('T')[0]
            : '',
        });
      } else {
        reset({
          productName: '',
          dosage: '',
          timing: '',
          purpose: '',
          priority: getNextPriority(),
          isActive: true,
          startDate: '',
          endDate: '',
        });
      }
    }
  }, [open, supplement, mode, reset, existingSupplements]);

  // Handle product name suggestions
  useEffect(() => {
    if (watchedProductName && watchedProductName.length > 1) {
      const filtered = COMMON_SUPPLEMENTS.filter(supp =>
        supp.toLowerCase().includes(watchedProductName.toLowerCase())
      );
      setProductSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [watchedProductName]);

  // Handle form submission
  const onSubmit = async (data: SupplementFormData) => {
    setIsSubmitting(true);

    try {
      // Check for duplicate supplement names (exclude current supplement if editing)
      const isDuplicate = existingSupplements.some(
        existing =>
          existing.productName.toLowerCase() ===
            data.productName.toLowerCase() &&
          (mode === 'add' || existing.id !== supplement?.id)
      );

      if (isDuplicate) {
        toast.error('Duplicate supplement', {
          description: `${data.productName} is already in this protocol`,
        });
        return;
      }

      // Prepare supplement data
      const supplementData: ProtocolSupplement = {
        ...supplement, // Include existing ID if editing
        productName: data.productName.trim(),
        dosage: data.dosage.trim(),
        timing: data.timing.trim(),
        purpose: data.purpose.trim() || undefined,
        priority: data.priority,
        isActive: data.isActive,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      };

      // Validate dates
      if (supplementData.startDate && supplementData.endDate) {
        if (supplementData.endDate <= supplementData.startDate) {
          toast.error('Invalid dates', {
            description: 'End date must be after start date',
          });
          return;
        }
      }

      onSave(supplementData);
      onOpenChange(false);

      toast.success(
        mode === 'add' ? 'Supplement added' : 'Supplement updated',
        {
          description: `${data.productName} has been ${
            mode === 'add' ? 'added to' : 'updated in'
          } the protocol`,
        }
      );
    } catch (error) {
      console.error('Error saving supplement:', error);
      toast.error('Failed to save supplement', {
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setValue('productName', suggestion);
    setShowSuggestions(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Pill className="h-5 w-5 text-blue-600" />
            {mode === 'add' ? 'Add Supplement' : 'Edit Supplement'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Add a new supplement to this protocol with dosage and timing instructions.'
              : 'Update supplement information, dosage, and timing instructions.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Product Name with Suggestions */}
          <div className="space-y-2">
            <Label
              htmlFor="productName"
              className="text-gray-900 font-medium dark:text-gray-100"
            >
              Supplement Name *
            </Label>
            <div className="relative">
              <Input
                id="productName"
                placeholder="e.g., Probiotics, Magnesium Glycinate, Vitamin D3"
                {...register('productName', {
                  required: 'Supplement name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
                className="pr-10"
                autoComplete="off"
              />
              <Plus className="absolute right-3 top-3 h-4 w-4 text-gray-400" />

              {/* Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                  <div className="py-1">
                    {productSuggestions.map(suggestion => (
                      <button
                        key={suggestion}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {errors.productName && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.productName.message}
              </p>
            )}
          </div>

          {/* Dosage and Timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="dosage"
                className="text-gray-900 font-medium dark:text-gray-100"
              >
                Dosage *
              </Label>
              <Input
                id="dosage"
                placeholder="e.g., 2 capsules, 500mg, 1 tsp"
                {...register('dosage', {
                  required: 'Dosage is required',
                })}
              />
              {errors.dosage && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.dosage.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="timing"
                className="text-gray-900 font-medium dark:text-gray-100"
              >
                Timing *
              </Label>
              <Select onValueChange={value => setValue('timing', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timing" />
                </SelectTrigger>
                <SelectContent>
                  {TIMING_OPTIONS.map(timing => (
                    <SelectItem key={timing} value={timing}>
                      {timing}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.timing && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.timing.message}
                </p>
              )}
            </div>
          </div>

          {/* Purpose and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="purpose"
                className="text-gray-900 font-medium dark:text-gray-100"
              >
                Purpose
              </Label>
              <Select onValueChange={value => setValue('purpose', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {PURPOSE_OPTIONS.map(purpose => (
                    <SelectItem key={purpose} value={purpose}>
                      {purpose}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="priority"
                className="text-gray-900 font-medium dark:text-gray-100"
              >
                Priority
              </Label>
              <div className="flex items-center gap-2">
                <Grip className="h-4 w-4 text-gray-400" />
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="20"
                  {...register('priority', {
                    required: 'Priority is required',
                    min: { value: 1, message: 'Priority must be at least 1' },
                    max: { value: 20, message: 'Priority cannot exceed 20' },
                  })}
                  className="flex-1"
                />
              </div>
              {errors.priority && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.priority.message}
                </p>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="startDate"
                className="text-gray-900 font-medium dark:text-gray-100"
              >
                Start Date
              </Label>
              <Input id="startDate" type="date" {...register('startDate')} />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="endDate"
                className="text-gray-900 font-medium dark:text-gray-100"
              >
                End Date
              </Label>
              <Input id="endDate" type="date" {...register('endDate')} />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Checkbox id="isActive" {...register('isActive')} />
            <Label
              htmlFor="isActive"
              className="text-gray-900 dark:text-gray-100"
            >
              Active supplement (include in current protocol)
            </Label>
          </div>

          {/* Priority Info */}
          <Alert>
            <Star className="h-4 w-4" />
            <AlertDescription>
              Priority determines the order supplements appear in the protocol.
              Lower numbers (1, 2, 3) appear first and are considered more
              important.
            </AlertDescription>
          </Alert>

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {mode === 'add' ? 'Adding...' : 'Updating...'}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {mode === 'add' ? 'Add Supplement' : 'Update Supplement'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
