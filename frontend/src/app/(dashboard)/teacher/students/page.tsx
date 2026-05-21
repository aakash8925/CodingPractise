"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Users, Award, CheckCircle, Search, ChevronRight, X, Loader2, AlertCircle
} from "lucide-react";
import { classroomService } from "@/services/classroomService";
import { taskService } from "@/services/taskService";
import { submissionService } from "@/services/submissionService";
import { Classroom, Task, Submission, User } from "@/types";

interface StudentStats {
  student: User;
  completedTasks: number;
  averageGrade: number | null;
  rating: "Elite" | "Strong" | "Developing" | "Needs Help" | "Inactive";
  lastActive: string | null;
  submissions: Submission[];
}

export default function TeacherStudentsMonitoringPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [students, setStudents] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [studentStats, setStudentStats] = useState<StudentStats[]>([]);
  
  // Search and detail states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentStats, setSelectedStudentStats] = useState<StudentStats | null>(null);

  // Loading / error states
  const [loadingClassrooms, setLoadingClassrooms] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchClassrooms = useCallback(async () => {
    try {
      setLoadingClassrooms(true);
      const rooms = await classroomService.getMyClassrooms();
      setClassrooms(rooms);
      if (rooms.length > 0) {
        setSelectedClassroomId(rooms[0].id.toString());
      }
    } catch (err) {
      console.error("Failed to fetch classrooms", err);
      setErrorMsg("Failed to load classrooms.");
    } finally {
      setLoadingClassrooms(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClassrooms();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchClassrooms]);

  const handleClassroomChange = (val: string) => {
    setSelectedClassroomId(val);
    if (!val) {
      setStudents([]);
      setTasks([]);
      setSubmissions([]);
      setStudentStats([]);
    }
  };

  // Aggregate student stats when classroom changes
  useEffect(() => {
    if (!selectedClassroomId) return;

    const loadClassroomData = async () => {
      try {
        setLoadingStats(true);
        setErrorMsg(null);
        const roomId = parseInt(selectedClassroomId, 10);

        // Fetch students, tasks, and submissions for the classroom
        const [studentList, classroomTasks] = await Promise.all([
          classroomService.getStudents(roomId),
          taskService.getByClassroom(roomId)
        ]);

        setStudents(studentList);
        setTasks(classroomTasks);

        // Fetch submissions for all classroom tasks
        let submissionsList: Submission[] = [];
        if (classroomTasks.length > 0) {
          const submissionsPromises = classroomTasks.map(t => submissionService.getByTask(t.id));
          const submissionsResults = await Promise.all(submissionsPromises);
          submissionsList = submissionsResults.flat();
          setSubmissions(submissionsList);
        } else {
          setSubmissions([]);
        }

        // Calculate student aggregate statistics
        const stats: StudentStats[] = studentList.map(student => {
          const studentSubs = submissionsList.filter(sub => sub.student?.id === student.id);
          
          // Filter submitted or reviewed tasks for completion metric
          const finishedSubs = studentSubs.filter(sub => sub.status === "SUBMITTED" || sub.status === "REVIEWED");
          const completedTasksCount = finishedSubs.length;

          // Calculate average grade for reviewed submissions
          const gradedSubs = studentSubs.filter(sub => sub.status === "REVIEWED" && sub.marks !== undefined && sub.marks !== null);
          const totalMarks = gradedSubs.reduce((sum, sub) => sum + (sub.marks || 0), 0);
          const averageGrade = gradedSubs.length > 0 ? parseFloat((totalMarks / gradedSubs.length).toFixed(1)) : null;

          // Determine rating
          let rating: "Elite" | "Strong" | "Developing" | "Needs Help" | "Inactive" = "Inactive";
          if (averageGrade !== null) {
            if (averageGrade >= 90) rating = "Elite";
            else if (averageGrade >= 75) rating = "Strong";
            else if (averageGrade >= 50) rating = "Developing";
            else rating = "Needs Help";
          } else if (studentSubs.length > 0) {
            rating = "Developing"; // Started doing tasks but none graded yet
          }

          // Get latest submission date
          const dateStrings = studentSubs
            .map(sub => sub.submittedAt || sub.updatedAt)
            .filter(Boolean);
          const lastActive = dateStrings.length > 0 
            ? new Date(Math.max(...dateStrings.map(d => new Date(d).getTime()))).toLocaleDateString()
            : null;

          return {
            student,
            completedTasks: completedTasksCount,
            averageGrade,
            rating,
            lastActive,
            submissions: studentSubs
          };
        });

        setStudentStats(stats);
      } catch (err) {
        console.error("Failed to load classroom monitoring stats", err);
        setErrorMsg("Failed to compile student analytics.");
      } finally {
        setLoadingStats(false);
      }
    };

    loadClassroomData();
  }, [selectedClassroomId]);

  // Overall classroom aggregates
  const totalStudents = students.length;
  const totalClassroomTasks = tasks.length;
  
  const classAvgScore = (() => {
    const gradedSubmissions = submissions.filter(s => s.status === "REVIEWED" && s.marks !== undefined && s.marks !== null);
    if (gradedSubmissions.length === 0) return null;
    const sum = gradedSubmissions.reduce((acc, s) => acc + (s.marks || 0), 0);
    return Math.round(sum / gradedSubmissions.length);
  })();

  const classCompletionRate = (() => {
    if (totalStudents === 0 || totalClassroomTasks === 0) return 0;
    const totalPotentialSubs = totalStudents * totalClassroomTasks;
    const submittedSubs = submissions.filter(s => s.status === "SUBMITTED" || s.status === "REVIEWED").length;
    return Math.round((submittedSubs / totalPotentialSubs) * 100);
  })();

  const filteredStudentStats = studentStats.filter(stat => 
    stat.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stat.student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRatingBadge = (rating: StudentStats["rating"]) => {
    switch (rating) {
      case "Elite":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Elite (≥90)</span>;
      case "Strong":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">Strong (75-89)</span>;
      case "Developing":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">Developing</span>;
      case "Needs Help":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">Needs Help (&lt;50)</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-500 border border-slate-700">No Activity</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="text-sky-400" /> Student Performance &amp; Tracking
          </h1>
          <p className="text-sm text-slate-400 mt-1">Monitor classroom skill profiles, submissions, and academic risk levels.</p>
        </div>

        {/* Classroom Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={selectedClassroomId}
            onChange={(e) => handleClassroomChange(e.target.value)}
            disabled={loadingClassrooms}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-sky-500/50 cursor-pointer disabled:opacity-50"
          >
            <option value="">-- Select Classroom --</option>
            {classrooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-4 rounded-xl flex items-center gap-2">
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {!selectedClassroomId ? (
        <div className="glass-card border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-sm">
          Please select a classroom from the top-right to view student monitoring sheets.
        </div>
      ) : loadingStats ? (
        <div className="h-64 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-sky-500 mb-4" size={32} />
          <p className="text-slate-500 text-sm animate-pulse">Analyzing class metrics...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Aggregates Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-5 border border-slate-800 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-sky-500/10 text-sky-400 rounded-lg">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrolled Students</p>
                <p className="text-2xl font-bold text-white mt-1">{totalStudents}</p>
              </div>
            </div>

            <div className="glass-card p-5 border border-slate-800 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Task Completion Rate</p>
                <p className="text-2xl font-bold text-white mt-1">{classCompletionRate}%</p>
              </div>
            </div>

            <div className="glass-card p-5 border border-slate-800 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
                <Award size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Class Average Grade</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {classAvgScore !== null ? `${classAvgScore} / 100` : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Roster & Search */}
          <div className="glass-card border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800/60 bg-slate-900/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">Classroom Roster Analytics</h2>
              
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50"
                />
              </div>
            </div>

            {/* Students Table */}
            {filteredStudentStats.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                No students matching search criteria or enrolled in this course.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/30 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-5">Student</th>
                      <th className="py-3 px-5 text-center">Completed Tasks</th>
                      <th className="py-3 px-5 text-center">Average Grade</th>
                      <th className="py-3 px-5 text-center">Rating</th>
                      <th className="py-3 px-5 text-center">Last Active</th>
                      <th className="py-3 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-sm text-slate-300">
                    {filteredStudentStats.map((stat) => (
                      <tr key={stat.student.id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="py-4 px-5">
                          <div>
                            <p className="font-semibold text-white">{stat.student.name}</p>
                            <p className="text-xs text-slate-500">{stat.student.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-center font-code font-bold text-slate-200">
                          {stat.completedTasks} / {totalClassroomTasks}
                        </td>
                        <td className="py-4 px-5 text-center font-code font-bold">
                          {stat.averageGrade !== null ? (
                            <span className={stat.averageGrade >= 75 ? "text-emerald-400" : stat.averageGrade >= 50 ? "text-amber-400" : "text-red-400"}>
                              {stat.averageGrade}%
                            </span>
                          ) : (
                            <span className="text-slate-650">N/A</span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-center">
                          {getRatingBadge(stat.rating)}
                        </td>
                        <td className="py-4 px-5 text-center text-xs text-slate-500 font-medium">
                          {stat.lastActive || "Never"}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => setSelectedStudentStats(stat)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
                          >
                            Breakdown <ChevronRight size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DETAILED STUDENT MODAL BREAKDOWN */}
      {selectedStudentStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
          <div className="glass-card border border-slate-800 w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users size={20} className="text-sky-400" />
                  {selectedStudentStats.student.name}&apos;s Skill Breakdown
                </h3>
                <p className="text-xs text-slate-400">{selectedStudentStats.student.email}</p>
              </div>
              <button
                onClick={() => setSelectedStudentStats(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Aggregate Profile summary */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tasks Completed</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {selectedStudentStats.completedTasks} / {totalClassroomTasks}
                  </p>
                </div>
                <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Average Grade</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {selectedStudentStats.averageGrade !== null ? `${selectedStudentStats.averageGrade}%` : "N/A"}
                  </p>
                </div>
                <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-center items-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Skill Rating</p>
                  {getRatingBadge(selectedStudentStats.rating)}
                </div>
              </div>

              {/* Task-by-task breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-850 pb-1.5">
                  Assignment History
                </h4>
                {tasks.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No tasks assigned in this classroom.</p>
                ) : (
                  <div className="space-y-3">
                    {tasks.map(task => {
                      const submission = selectedStudentStats.submissions.find(s => s.taskId === task.id);
                      
                      return (
                        <div 
                          key={task.id} 
                          className="bg-slate-950/30 border border-slate-800/60 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <p className="font-bold text-slate-200">{task.title}</p>
                            <p className="text-[10px] text-slate-500">Due: {new Date(task.deadline).toLocaleDateString()}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            {submission ? (
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  submission.status === "REVIEWED" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                                  submission.status === "SUBMITTED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                  "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                }`}>
                                  {submission.status.toLowerCase().replace("_", " ")}
                                </span>
                                
                                {submission.marks !== undefined && submission.marks !== null ? (
                                  <span className="font-bold text-emerald-400">{submission.marks} / 100</span>
                                ) : (
                                  <span className="text-slate-500">Ungraded</span>
                                )}
                              </div>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-500 border border-slate-700">
                                Not Started
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedStudentStats(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2 rounded-lg font-bold text-xs border border-slate-750 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
