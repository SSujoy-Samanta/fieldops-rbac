"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Square,
  MapPin,
  Compass,
  CheckCircle2,
  Calendar,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useClockIn } from "@/hooks/useAttendance";
import type { TodayAttendanceStatus } from "@/types/attendance";
import { toast } from "sonner";

interface ShiftControlCardProps {
  todayStatus: TodayAttendanceStatus | null;
  isLoading: boolean;
  onOpenClockOutModal: () => void;
}

export function ShiftControlCard({
  todayStatus,
  isLoading,
  onOpenClockOutModal,
}: ShiftControlCardProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [locationNotes, setLocationNotes] = useState<string>("");
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const clockInMutation = useClockIn();

  const isClockedIn = todayStatus?.isClockedIn ?? false;
  const activeSession = todayStatus?.currentSession;

  // ── 1. Live Current Time Ticker ──
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ── 2. Live Shift Duration Stopwatch ──
  useEffect(() => {
    if (!isClockedIn || !activeSession?.clockIn) {
      setElapsedSeconds(0);
      return;
    }

    const clockInTime = new Date(activeSession.clockIn).getTime();

    const updateStopwatch = () => {
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((now - clockInTime) / 1000));
      setElapsedSeconds(diffSecs);
    };

    updateStopwatch();
    const interval = setInterval(updateStopwatch, 1000);
    return () => clearInterval(interval);
  }, [isClockedIn, activeSession?.clockIn]);

  // Format Elapsed Time (HH:MM:SS)
  const formatStopwatch = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return {
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
    };
  };

  const formattedStopwatch = formatStopwatch(elapsedSeconds);

  // ── 3. Browser Geolocation GPS Capture ──
  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude.toFixed(5);
        const lng = pos.coords.longitude.toFixed(5);
        const gpsString = `GPS: ${lat}, ${lng} (±${Math.round(pos.coords.accuracy)}m)`;
        setLocationNotes((prev) => (prev ? `${prev} | ${gpsString}` : gpsString));
        toast.success("Current GPS location tagged!");
      },
      (err) => {
        setIsLocating(false);
        let errorMsg = "Unable to retrieve GPS coordinates.";
        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = "Location permission denied. Please allow location access or type manually.";
        }
        toast.info(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // ── 4. Clock In Handler ──
  const handleClockIn = async () => {
    try {
      await clockInMutation.mutateAsync({
        locationNotes: locationNotes.trim() || undefined,
      });
      setLocationNotes("");
    } catch {
      // Toast handled by hook
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-orange-500/30 bg-gradient-to-br from-orange-500/[0.08] via-card/90 to-amber-500/[0.04] dark:from-orange-950/40 dark:via-card/90 dark:to-background backdrop-blur-xl shadow-lg shadow-orange-500/5 p-6 sm:p-8">
      {/* ── Subtle Background Watermark / Glow ── */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-orange-500/10 dark:bg-orange-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-500/10 dark:bg-amber-500/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        {/* ── Left Column: Live Digital Clock & Shift Status ── */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {isClockedIn ? (
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-xs"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>CLOCKED IN — ON DUTY</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-muted/60 text-muted-foreground border-border/80"
              >
                <span className="h-2 w-2 rounded-full bg-muted-foreground/60" />
                <span>OFF DUTY — READY TO SHIFT</span>
              </Badge>
            )}

            <Badge
              variant="outline"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono text-muted-foreground border-border/60"
            >
              <Calendar className="h-3 w-3 text-orange-500" />
              <span>
                {currentTime
                  ? currentTime.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Loading..."}
              </span>
            </Badge>
          </div>

          {/* Current Live Time (Big Typography) */}
          <div className="flex flex-col">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground font-mono">
              {currentTime ? (
                <>
                  <span>{currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                </>
              ) : (
                <span>--:--:--</span>
              )}
            </div>
            <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <Compass className="h-3.5 w-3.5 text-orange-500" />
              <span>Standard Operations Timezone (Local System Clock)</span>
            </span>
          </div>

          {/* Active Session Info Pill */}
          {isClockedIn && activeSession && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.08] text-xs max-w-md">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-foreground">
                  Shift started at{" "}
                  {new Date(activeSession.clockIn).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="text-[11px] text-muted-foreground truncate">
                  {activeSession.locationNotes || "No location notes recorded"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column: Interactive Stopwatch & Action Controls ── */}
        <div className="flex flex-col items-start lg:items-end gap-5">
          {/* Active Shift Elapsed Timer */}
          {isClockedIn ? (
            <div className="flex flex-col items-start lg:items-end">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Active Shift Elapsed
              </span>
              <div className="flex items-center gap-1.5 p-3 sm:p-4 rounded-2xl border border-emerald-500/30 bg-background/80 shadow-xs font-mono">
                <div className="flex flex-col items-center">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {formattedStopwatch.hours}
                  </span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">
                    Hours
                  </span>
                </div>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600/60 dark:text-emerald-400/60 pb-3">
                  :
                </span>
                <div className="flex flex-col items-center">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {formattedStopwatch.minutes}
                  </span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">
                    Mins
                  </span>
                </div>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600/60 dark:text-emerald-400/60 pb-3">
                  :
                </span>
                <div className="flex flex-col items-center">
                  <span className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400">
                    {formattedStopwatch.seconds}
                  </span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">
                    Secs
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Optional Location Tagging Field before Clocking In */
            <div className="w-full sm:w-80 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">Location / Notes</span>
                <button
                  type="button"
                  onClick={handleCaptureGps}
                  disabled={isLocating}
                  className="text-orange-600 dark:text-orange-400 font-bold hover:underline cursor-pointer flex items-center gap-1 text-[11px]"
                >
                  {isLocating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <MapPin className="h-3 w-3" />
                  )}
                  <span>{isLocating ? "Tagging GPS..." : "Auto-Tag GPS"}</span>
                </button>
              </div>

              <Input
                placeholder="e.g. Main HQ Office, Floor 2"
                value={locationNotes}
                onChange={(e) => setLocationNotes(e.target.value)}
                className="h-10 rounded-lg text-xs border-border/80 bg-background/80 focus-visible:ring-orange-500"
                disabled={clockInMutation.isPending}
              />
            </div>
          )}

          {/* ── Main Dual-State Action Button ── */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isClockedIn ? (
              <Button
                type="button"
                onClick={onOpenClockOutModal}
                disabled={isLoading}
                className="h-12 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 transition-all cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Square className="h-4 w-4 fill-white" />
                <span>End Shift & Clock Out</span>
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleClockIn}
                disabled={isLoading || clockInMutation.isPending}
                className="h-12 px-8 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 hover:from-orange-700 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {clockInMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Clocking In...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-white" />
                    <span>Clock In Shift</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShiftControlCard;
