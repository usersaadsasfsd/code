// components/leads/LeadFilters.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { LeadFilters as Filters } from '@/types/lead';
import { useAgents } from '@/hooks/useAgents';
import { budgetRanges } from '@/lib/mockData';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, subMonths } from 'date-fns';

interface LeadFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  leadCounts: Record<string, number>;
}

const statusOptions = [
  'New', 'Contacted', 'Qualified', 'Nurturing', 'Site Visit Scheduled','RNR', 'Busy', 'Disconnected', 'Switch Off', 'Invalid Number', 'Incoming Call Not Allowed (ICNA)', 'DNE (Does Not Exist)', 'Forward call', 'Out Of Network', 'Not Interested', 'Not Interested (project)', 'Low Potential',
  'Site Visited', 'Negotiation', 'Converted', 'Lost', 'Hold'
];



const sourceOptions = ['Website', 'Referral', 'Social Media', 'Walk-in', 'Advertisement', 'Other'];
const propertyTypeOptions = ['Residential', 'Commercial', 'Land'];
const leadScoreOptions = ['High', 'Medium', 'Low'];
// FIX: Explicitly type leadTypeOptions as an array of 'Lead' | 'Cold-Lead'
const leadTypeOptions: Array<'Lead' | 'Cold-Lead'> = ['Lead', 'Cold-Lead']; 

type DateRangePreset = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'last3months' | 'thisYear' | 'custom';

const dateRangePresets: { value: DateRangePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'last3months', label: 'Last 3 Months' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];

export function LeadFilters({ filters, onFiltersChange, leadCounts }: LeadFiltersProps) {
  const { agents } = useAgents();
  const [isExpanded, setIsExpanded] = useState(false);
  const [dateFilterType, setDateFilterType] = useState<'receivedDate' | 'createdAt'>(filters.dateFilterType || 'receivedDate');
  const [selectedDatePreset, setSelectedDatePreset] = useState<DateRangePreset | ''>('');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(filters.dateRange?.start);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(filters.dateRange?.end);
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);

  const getDateRangeFromPreset = (preset: DateRangePreset): { start: Date; end: Date } | undefined => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    switch (preset) {
      case 'today':
        return { start: startOfToday, end: today };
      case 'yesterday':
        const yesterday = subDays(startOfToday, 1);
        const endOfYesterday = new Date(yesterday);
        endOfYesterday.setHours(23, 59, 59, 999);
        return { start: yesterday, end: endOfYesterday };
      case 'last7days':
        return { start: subDays(startOfToday, 6), end: today };
      case 'last30days':
        return { start: subDays(startOfToday, 29), end: today };
      case 'thisMonth':
        return { start: startOfMonth(today), end: endOfMonth(today) };
      case 'lastMonth':
        const lastMonth = subMonths(today, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case 'last3months':
        return { start: subMonths(startOfToday, 3), end: today };
      case 'thisYear':
        return { start: startOfYear(today), end: today };
      case 'custom':
        return undefined;
      default:
        return undefined;
    }
  };

  const handleDatePresetChange = (preset: DateRangePreset) => {
    setSelectedDatePreset(preset);
    if (preset === 'custom') {
      // Don't change dateRange yet, wait for custom dates
      return;
    }
    const dateRange = getDateRangeFromPreset(preset);
    console.log("[v0] Date preset selected:", preset, "dateRange:", dateRange);
    if (dateRange) {
      updateFilters({ dateRange, dateFilterType });
    }
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);
  };

  const handleCustomDateChange = (type: 'start' | 'end', date: Date | undefined) => {
    if (type === 'start') {
      setCustomStartDate(date);
      if (date && customEndDate) {
        updateFilters({ dateRange: { start: date, end: customEndDate }, dateFilterType });
      }
    } else {
      setCustomEndDate(date);
      if (customStartDate && date) {
        updateFilters({ dateRange: { start: customStartDate, end: date }, dateFilterType });
      }
    }
  };

  const handleDateFilterTypeChange = (type: 'receivedDate' | 'createdAt') => {
    setDateFilterType(type);
    if (filters.dateRange) {
      updateFilters({ dateFilterType: type });
    }
  };

  const clearDateFilter = () => {
    setSelectedDatePreset('');
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);
    updateFilters({ dateRange: undefined, dateFilterType: undefined });
  };

  const updateFilters = (updates: Partial<Filters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearFilters = () => {
    setSelectedDatePreset('');
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);
    setDateFilterType('receivedDate');
    onFiltersChange({
      search: undefined,
      status: undefined,
      assignedAgent: undefined,
      source: undefined,
      propertyType: undefined,
      budgetRange: undefined,
      leadScore: undefined,
      leadType: undefined, 
      dateRange: undefined,
      dateFilterType: undefined,
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== undefined && value !== ''
  );

  const activeFilterCount = [
    filters.status?.length || 0,
    filters.assignedAgent ? 1 : 0,
    filters.source?.length || 0,
    filters.propertyType?.length || 0,
    filters.budgetRange ? 1 : 0,
    filters.leadScore?.length || 0,
    filters.search ? 1 : 0,
    filters.leadType?.length || 0,
    filters.dateRange ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  return (
    <Card className="border-0 shadow-md mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-lg font-semibold">Filters</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm"
            >
              <Filter className="h-4 w-4 mr-1" />
              {isExpanded ? 'Less' : 'More'} Filters
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search leads by name, email, or phone..."
            value={filters.search || ''}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Date Filter Section */}
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date Filter
            </Label>
            {filters.dateRange && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearDateFilter}
                className="text-gray-500 hover:text-gray-700 h-7 px-2"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Date Filter Type */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Filter By</Label>
              <Select
                value={dateFilterType}
                onValueChange={(value: 'receivedDate' | 'createdAt') => handleDateFilterTypeChange(value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receivedDate">Received Date</SelectItem>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Preset */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Date Range</Label>
              <Select
                value={selectedDatePreset}
                onValueChange={(value: DateRangePreset) => handleDatePresetChange(value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  {dateRangePresets.map(preset => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range - only show when custom is selected */}
            {selectedDatePreset === 'custom' && (
              <>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Start Date</Label>
                  <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal h-9 bg-transparent"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {customStartDate ? format(customStartDate, 'dd MMM yyyy') : 'Pick date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={customStartDate}
                        onSelect={(date) => {
                          handleCustomDateChange('start', date);
                          setIsStartDateOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">End Date</Label>
                  <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal h-9 bg-transparent"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {customEndDate ? format(customEndDate, 'dd MMM yyyy') : 'Pick date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={customEndDate}
                        onSelect={(date) => {
                          handleCustomDateChange('end', date);
                          setIsEndDateOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}
          </div>

          {/* Show active date filter info */}
          {filters.dateRange && (
            <div className="text-xs text-gray-600 flex items-center gap-1 mt-2">
              <span>Filtering by {dateFilterType === 'receivedDate' ? 'Received Date' : 'Created Date'}:</span>
              <Badge variant="secondary" className="text-xs">
                {format(filters.dateRange.start, 'dd MMM yyyy')} - {format(filters.dateRange.end, 'dd MMM yyyy')}
              </Badge>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Status</Label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(status => (
              <Button
                key={status}
                variant={filters.status?.includes(status) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const currentStatuses = filters.status || [];
                  const newStatuses = currentStatuses.includes(status)
                    ? currentStatuses.filter(s => s !== status)
                    : [...currentStatuses, status];
                  updateFilters({ status: newStatuses });
                }}
                className="text-xs"
              >
                {status}
                {leadCounts[status] > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {leadCounts[status]}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
          <div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Lead Score</Label>
                <div className="space-y-2 flex">
                  {leadScoreOptions.map(score => (
                    <div key={score} className="flex items-center space-x-2 mr-10">
                      <Checkbox
                        id={`score-${score}`}
                        checked={filters.leadScore?.includes(score) || false}
                        onCheckedChange={(checked) => {
                          const currentScores = filters.leadScore || [];
                          const newScores = checked
                            ? [...currentScores, score]
                            : currentScores.filter(s => s !== score);
                          updateFilters({ leadScore: newScores });
                        }}
                      />
                      <Label htmlFor={`score-${score}`} className="text-sm">
                        {score} Priority
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
          </div>
        </div>

        {isExpanded && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Assigned Agent</Label>
                <Select
                  value={filters.assignedAgent || 'all-agents'}
                  onValueChange={(value) => updateFilters({ assignedAgent: value === 'all-agents' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All agents" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-agents">All agents</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {agents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Budget Range (INR)</Label>
                <Select
                  value={filters.budgetRange || 'all-budgets'}
                  onValueChange={(value) => updateFilters({ budgetRange: value === 'all-budgets' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All budgets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-budgets">All budgets</SelectItem>
                    {budgetRanges.map(range => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Lead Source</Label>
              <div className="flex flex-wrap gap-2">
                {sourceOptions.map(source => (
                  <Button
                    key={source}
                    variant={filters.source?.includes(source) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const currentSources = filters.source || [];
                      const newSources = currentSources.includes(source)
                        ? currentSources.filter(s => s !== source)
                        : [...currentSources, source];
                      updateFilters({ source: newSources });
                    }}
                    className="text-xs"
                  >
                    {source}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Property Type</Label>
                <div className="space-y-2">
                  {propertyTypeOptions.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`property-${type}`}
                        checked={filters.propertyType?.includes(type) || false}
                        onCheckedChange={(checked) => {
                          const currentTypes = filters.propertyType || [];
                          const newTypes = checked
                            ? [...currentTypes, type]
                            : currentTypes.filter(t => t !== type);
                          updateFilters({ propertyType: newTypes });
                        }}
                      />
                      <Label htmlFor={`property-${type}`} className="text-sm">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Lead Score</Label>
                <div className="space-y-2">
                  {leadScoreOptions.map(score => (
                    <div key={score} className="flex items-center space-x-2">
                      <Checkbox
                        id={`score-${score}`}
                        checked={filters.leadScore?.includes(score) || false}
                        onCheckedChange={(checked) => {
                          const currentScores = filters.leadScore || [];
                          const newScores = checked
                            ? [...currentScores, score]
                            : currentScores.filter(s => s !== score);
                          updateFilters({ leadScore: newScores });
                        }}
                      />
                      <Label htmlFor={`score-${score}`} className="text-sm">
                        {score} Priority
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* ADDED: Lead Type Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Lead Type</Label>
                <div className="space-y-2">
                  {leadTypeOptions.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`leadType-${type}`}
                        checked={filters.leadType?.includes(type) || false}
                        onCheckedChange={(checked) => {
                          const currentTypes = filters.leadType || [];
                          // 'type' is now correctly typed as 'Lead' | 'Cold-Lead'
                          const newTypes = checked
                            ? [...currentTypes, type] 
                            : currentTypes.filter(t => t !== type);
                          updateFilters({ leadType: newTypes });
                        }}
                      />
                      <Label htmlFor={`leadType-${type}`} className="text-sm">
                        {type.replace('-', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
