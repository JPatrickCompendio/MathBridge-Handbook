import { Href, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { database } from '../../services/database';
import {
  fetchAllUsersWithSummaries,
  fetchUserScores,
  fetchUserAchievements,
  fetchQuizAttemptDetails,
  fetchPasswordResetRequests,
  completePasswordResetRequest,
  adminSetPassword,
  type AdminUserSummary,
  type AdminOverview,
  type PasswordResetRequest,
} from '../../services/adminData.web';
import type { AchievementRecord, ScoreRecord } from '../../services/database/types';
import type { QuizAnswerDetail } from '../../services/database/types';
import { Spacing } from '../../constants/colors';
import { getSpacing, isWeb, scaleFont, scaleSize, useResponsive } from '../../utils/responsive';

const ADMIN_EMAILS = ['admin@example.com']; // TODO: replace with your real teacher/admin email(s)

const TOPIC_LABELS: Record<number, string> = {
  1: 'Quadratic Equations',
  2: 'Triangle Triples',
  3: 'Triangle Measures',
  4: 'Area of Triangles',
  5: 'Variation',
};

/** Map achievement id → display info for admin modal (matches app/tabs/achievements.tsx definitions). */
const ACHIEVEMENT_DISPLAY: Record<string, { title: string; icon: string; color: string }> = {
  topic_1_master: { title: 'Quadratic Equations Master', icon: '🧮', color: '#4ECDC4' },
  topic_2_master: { title: 'Triangle Triples Master', icon: '🎯', color: '#45B7D1' },
  topic_3_master: { title: 'Triangle Measures Master', icon: '△', color: '#9B59B6' },
  topic_4_master: { title: 'Area of Triangles Master', icon: '📐', color: '#4ECDC4' },
  topic_5_master: { title: 'Variation Master', icon: '📊', color: '#FF6600' },
  first_steps: { title: 'First Steps', icon: '🌟', color: '#61E35D' },
  half_way: { title: 'Half Way', icon: '📖', color: '#FFA726' },
  dedicated_learner: { title: 'Dedicated Learner', icon: '👑', color: '#AB47BC' },
  bookworm: { title: 'Bookworm', icon: '📚', color: '#5D4E75' },
  perfect_five: { title: 'Perfect Five', icon: '💯', color: '#FFD700' },
  weekly_warrior: { title: 'Weekly Warrior', icon: '🔥', color: '#FF6B6B' },
  monthly_champion: { title: 'Monthly Champion', icon: '🏆', color: '#FFD700' },
};

function getAchievementDisplay(id: string): { title: string; icon: string; color: string } {
  const known = ACHIEVEMENT_DISPLAY[id];
  if (known) return known;
  const title = id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return { title, icon: '🏅', color: '#94A3B8' };
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Generates and opens a print-ready student report (web only) */
function openPrintReport(
  student: AdminUserSummary,
  scores: ScoreRecord[],
  achievements: AchievementRecord[]
): void {
  if (typeof window === 'undefined' || !window.Blob || !URL.createObjectURL) return;

  const name = escapeHtml(student.username || student.displayName || student.email || 'Student');
  const email = escapeHtml(student.email || '');
  const joinedDate = student.createdAt ? new Date(student.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : '—';
  const topicRows = Object.entries(student.topicProgress || {}).map(([tid, value]) => {
    const label = TOPIC_LABELS[Number(tid)] || `Topic ${tid}`;
    const pct = value ?? 0;
    return `<tr><td>${label}</td><td><div class="bar-wrap"><div class="bar-fill" style="width:${pct}%"></div></div></td><td>${pct}%</td></tr>`;
  }).join('');
  const scoreRows = scores.slice(0, 15).map((s) => {
    const topicName = TOPIC_LABELS[s.topicId] ?? `Topic ${s.topicId}`;
    const pct = s.total > 0 ? Math.round((s.score / s.total) * 100) : 0;
    const date = s.completedAt ? new Date(s.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    return `<tr><td>${topicName}</td><td>${s.score}/${s.total}</td><td>${pct}%</td><td>${date}</td></tr>`;
  }).join('');
  const achievementItems = achievements.map((a) => {
    const { title, icon } = getAchievementDisplay(a.id);
    const dateStr = a.unlockedAt ? new Date(a.unlockedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
    return `<li><span class="ach-icon">${escapeHtml(icon)}</span> ${escapeHtml(title)}${dateStr ? ` <span class="ach-date">(${dateStr})</span>` : ''}</li>`;
  }).join('');

  const generatedAt = new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Student Report - ${name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1e293b; padding: 32px; max-width: 800px; margin: 0 auto; line-height: 1.5; }
    .header { text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #10B981; }
    .header h1 { font-size: 24px; color: #0f172a; margin-bottom: 4px; }
    .header .sub { font-size: 13px; color: #64748b; }
    .student-card { background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #a7f3d0; }
    .student-card h2 { font-size: 20px; color: #065f46; margin-bottom: 8px; }
    .student-card .email { color: #047857; font-size: 14px; margin-bottom: 12px; }
    .stats { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 12px; }
    .stat { background: white; padding: 12px 16px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-value { font-size: 18px; font-weight: 700; color: #10B981; }
    .section { margin-bottom: 28px; }
    .section h3 { font-size: 16px; color: #0f172a; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; color: #475569; font-weight: 600; font-size: 12px; text-transform: uppercase; }
    .bar-wrap { background: #e2e8f0; border-radius: 6px; height: 10px; overflow: hidden; }
    .bar-fill { background: linear-gradient(90deg, #10B981, #34d399); height: 100%; border-radius: 6px; }
    ul { list-style: none; }
    ul li { padding: 8px 0; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 8px; }
    .ach-icon { font-size: 18px; }
    .ach-date { font-size: 12px; color: #94a3b8; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
    .no-print { padding: 24px; text-align: center; }
    .print-btn { padding: 12px 24px; background: #10B981; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    @media print { body { padding: 16px; } .no-print { display: none !important; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Math Bridge Handbook</h1>
    <p class="sub">Student Progress Report</p>
  </div>
  <div class="student-card">
    <h2>${name}</h2>
    <p class="email">${email}</p>
    <div class="stats">
      <div class="stat"><div class="stat-label">Joined</div><div class="stat-value">${joinedDate}</div></div>
      <div class="stat"><div class="stat-label">Overall Progress</div><div class="stat-value">${student.combinedProgress}%</div></div>
      <div class="stat"><div class="stat-label">Quizzes Taken</div><div class="stat-value">${student.quizzesTaken}</div></div>
      <div class="stat"><div class="stat-label">Avg Score</div><div class="stat-value">${student.avgScore}%</div></div>
      ${student.streak != null ? `<div class="stat"><div class="stat-label">Current Streak</div><div class="stat-value">${student.streak} day(s)</div></div>` : ''}
    </div>
  </div>
  <div class="section">
    <h3>Progress by Topic</h3>
    ${topicRows ? `<table><thead><tr><th>Topic</th><th>Progress</th><th></th></tr></thead><tbody>${topicRows}</tbody></table>` : '<p style="color:#94a3b8;">No topic progress recorded yet.</p>'}
  </div>
  <div class="section">
    <h3>Quiz Scores</h3>
    ${scoreRows ? `<table><thead><tr><th>Topic</th><th>Score</th><th>%</th><th>Date</th></tr></thead><tbody>${scoreRows}</tbody></table>` : '<p style="color:#94a3b8;">No quiz attempts yet.</p>'}
  </div>
  <div class="section">
    <h3>Achievements</h3>
    ${achievementItems ? `<ul>${achievementItems}</ul>` : '<p style="color:#94a3b8;">No achievements unlocked yet.</p>'}
  </div>
  <div class="footer">
    Generated on ${generatedAt} · Math Bridge Handbook
  </div>
  <div class="no-print">
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer,width=900,height=700');
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

type TabKey = 'overview' | 'students' | 'leaderboard';

function filterUsersByName(users: AdminUserSummary[], query: string): AdminUserSummary[] {
  const q = query.trim().toLowerCase();
  if (!q) return users;
  return users.filter((u) => {
    const name = (u.username || u.displayName || u.email || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    return name.includes(q) || email.includes(q);
  });
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<AdminUserSummary | null>(null);
  const [studentModalVisible, setStudentModalVisible] = useState(false);
  const [studentScores, setStudentScores] = useState<ScoreRecord[]>([]);
  const [studentAchievements, setStudentAchievements] = useState<AchievementRecord[]>([]);
  const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [passwordResetRequests, setPasswordResetRequests] = useState<PasswordResetRequest[]>([]);
  const [passwordResetRequestsLoading, setPasswordResetRequestsLoading] = useState(false);
  const [setPasswordModal, setSetPasswordModal] = useState<{ request: PasswordResetRequest; user?: AdminUserSummary } | null>(null);
  const backgroundAnim = React.useRef(new Animated.Value(0)).current;
  const headerOpacity = React.useRef(new Animated.Value(0)).current;
  const headerScale = React.useRef(new Animated.Value(0.96)).current;
  const { isWideScreen } = useResponsive();
  const narrowWeb = isWeb() && !isWideScreen;

  useEffect(() => {
    if (!isWeb()) {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function init() {
      try {
        const user = await database.getUserData();
        if (!user || !user.email) {
          if (!cancelled) {
            setAuthorized(false);
            // If not logged in, send to login page
            router.replace('/auth/login' as Href);
          }
          return;
        }
        const email = user.email.toLowerCase();
        const isAdmin = ADMIN_EMAILS.includes(email);
        if (!cancelled) {
          setAuthorized(isAdmin);
          if (!isAdmin) {
            setError('You are not authorized to view the admin dashboard.');
            setLoading(false);
            return;
          }
        }

        const { overview: ov, users: summaries } = await fetchAllUsersWithSummaries();
        if (!cancelled) {
          setOverview(ov);
          setUsers(summaries);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError('Failed to load admin data. Please try again later.');
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [router]);

  // Exclude admin accounts from student lists (admin sees only students, not themselves)
  const studentsOnly = useMemo(
    () => users.filter((u) => !ADMIN_EMAILS.includes((u.email || '').toLowerCase())),
    [users]
  );

  const sortedByProgress = useMemo(
    () => [...studentsOnly].sort((a, b) => b.combinedProgress - a.combinedProgress),
    [studentsOnly]
  );
  const topByScore = useMemo(
    () => [...studentsOnly].sort((a, b) => b.avgScore - a.avgScore).slice(0, 10),
    [studentsOnly]
  );

  const overviewAdjusted = useMemo(() => {
    if (!overview) return overview;
    const totalStudents = studentsOnly.length;
    const avgCombinedProgress =
      totalStudents > 0
        ? Math.round(
            studentsOnly.reduce((sum, u) => sum + u.combinedProgress, 0) / totalStudents
          )
        : 0;
    const totalQuizzesTaken = studentsOnly.reduce((sum, u) => sum + u.quizzesTaken, 0);
    return {
      ...overview,
      totalStudents,
      avgCombinedProgress,
      totalQuizzesTaken,
    };
  }, [overview, studentsOnly]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundAnim, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [backgroundAnim]);

  useEffect(() => {
    if (authorized !== true) return;
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(headerScale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }),
    ]).start();
  }, [authorized, headerOpacity, headerScale]);

  useEffect(() => {
    if (authorized === true && activeTab === 'students') {
      setPasswordResetRequestsLoading(true);
      fetchPasswordResetRequests()
        .then(setPasswordResetRequests)
        .catch(() => setPasswordResetRequests([]))
        .finally(() => setPasswordResetRequestsLoading(false));
    }
  }, [authorized, activeTab]);

  const handleStudentSelect = async (user: AdminUserSummary | null) => {
    setSelectedStudent(user);
    if (user) {
      setStudentModalVisible(true);
      setStudentDetailsLoading(true);
      try {
        const [scores, achievements] = await Promise.all([
          fetchUserScores(user.id),
          fetchUserAchievements(user.id),
        ]);
        setStudentScores(scores);
        setStudentAchievements(achievements);
      } finally {
        setStudentDetailsLoading(false);
      }
    } else {
      setStudentModalVisible(false);
      setStudentScores([]);
      setStudentAchievements([]);
    }
  };

  if (!isWeb()) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            The admin dashboard is only available on the web version.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF6600" />
          <Text style={styles.loadingText}>Loading admin dashboard…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (authorized === false) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error || 'Not authorized.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={[styles.header, narrowWeb && styles.headerMobileWeb]}>
        <Animated.View style={[styles.headerTitleWrap, { opacity: headerOpacity, transform: [{ scale: headerScale }] }]}>
          <Text style={styles.headerTitle}>TEACHER DASHBOARD</Text>
        </Animated.View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setLogoutConfirmVisible(true)}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.tabBar, narrowWeb && styles.tabBarMobileWeb]}>
        <TabButton label="Overview" tab="overview" activeTab={activeTab} onPress={setActiveTab} />
        <TabButton label="Leaderboard" tab="leaderboard" activeTab={activeTab} onPress={setActiveTab} />
        <TabButton label="Students" tab="students" activeTab={activeTab} onPress={setActiveTab} />
      </View>

      <View style={styles.contentWrapper}>
        <AnimatedBackground variant={activeTab} animatedValue={backgroundAnim} />

        <ScrollView
          style={styles.content}
          contentContainerStyle={[styles.contentInner, narrowWeb && styles.contentInnerMobileWeb]}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'overview' && overviewAdjusted && (
            <OverviewTab
              overview={overviewAdjusted}
              users={studentsOnly}
              onStudentPress={handleStudentSelect}
              searchQuery={studentSearchQuery}
              onSearchChange={setStudentSearchQuery}
              narrow={narrowWeb}
            />
          )}
          {activeTab === 'students' && (
            <StudentsTab
              users={studentsOnly}
              searchQuery={studentSearchQuery}
              onSearchChange={setStudentSearchQuery}
              passwordResetRequests={passwordResetRequests}
              passwordResetRequestsLoading={passwordResetRequestsLoading}
              narrow={narrowWeb}
              onRefreshRequests={() => {
                setPasswordResetRequestsLoading(true);
                fetchPasswordResetRequests()
                  .then(setPasswordResetRequests)
                  .catch(() => setPasswordResetRequests([]))
                  .finally(() => setPasswordResetRequestsLoading(false));
              }}
              onSetPassword={(request, user) => setSetPasswordModal({ request, user })}
            />
          )}
          {activeTab === 'leaderboard' && (
            <LeaderboardTab byProgress={sortedByProgress} byScore={topByScore} narrow={narrowWeb} />
          )}
        </ScrollView>
      </View>

      {selectedStudent && activeTab !== 'students' && (
        <StudentDetailModal
          visible={studentModalVisible}
          onClose={() => {
            setStudentModalVisible(false);
            setSelectedStudent(null);
          }}
          student={selectedStudent}
          scores={studentScores}
          achievements={studentAchievements}
          loading={studentDetailsLoading}
          onFetchAttemptDetails={(scoreId) => fetchQuizAttemptDetails(selectedStudent.id, scoreId)}
        />
      )}

      {setPasswordModal && (
        <SetPasswordModal
          visible={!!setPasswordModal}
          request={setPasswordModal.request}
          user={setPasswordModal.user}
          onClose={() => setSetPasswordModal(null)}
          onSuccess={(requestId) => {
            setSetPasswordModal(null);
            setPasswordResetRequests((prev) => prev.filter((r) => r.id !== requestId));
            setPasswordResetRequestsLoading(true);
            fetchPasswordResetRequests()
              .then(setPasswordResetRequests)
              .catch(() => setPasswordResetRequests([]))
              .finally(() => setPasswordResetRequestsLoading(false));
          }}
        />
      )}

      <Modal
        visible={logoutConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutConfirmVisible(false)}
      >
        <View style={styles.logoutConfirmOverlay}>
          <View style={styles.logoutConfirmCard}>
            <Text style={styles.logoutConfirmTitle}>Log out?</Text>
            <Text style={styles.logoutConfirmMessage}>Are you sure you want to log out of the teacher dashboard?</Text>
            <View style={styles.logoutConfirmActions}>
              <TouchableOpacity
                style={styles.logoutConfirmCancel}
                onPress={() => setLogoutConfirmVisible(false)}
              >
                <Text style={styles.logoutConfirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutConfirmOk}
                onPress={async () => {
                  setLogoutConfirmVisible(false);
                  try {
                    await database.signOut();
                  } catch {
                    // ignore
                  }
                  router.replace('/auth/login' as Href);
                }}
              >
                <Text style={styles.logoutConfirmOkText}>Log out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const PARTICLE_CONFIG: { left: string; top: string; size: number; phase: number }[] = [
  { left: '10%', top: '15%', size: 6, phase: 0 },
  { left: '85%', top: '20%', size: 8, phase: 0.2 },
  { left: '25%', top: '45%', size: 5, phase: 0.5 },
  { left: '70%', top: '35%', size: 7, phase: 0.8 },
  { left: '5%', top: '60%', size: 6, phase: 0.3 },
  { left: '90%', top: '55%', size: 5, phase: 0.6 },
  { left: '40%', top: '25%', size: 4, phase: 0.1 },
  { left: '55%', top: '70%', size: 8, phase: 0.4 },
  { left: '18%', top: '80%', size: 5, phase: 0.7 },
  { left: '75%', top: '12%', size: 6, phase: 0.9 },
  { left: '32%', top: '90%', size: 4, phase: 0.25 },
  { left: '62%', top: '48%', size: 7, phase: 0.55 },
  { left: '48%', top: '8%', size: 5, phase: 0.35 },
  { left: '8%', top: '40%', size: 6, phase: 0.65 },
  { left: '92%', top: '75%', size: 5, phase: 0.15 },
];

function AnimatedBackground({
  variant,
  animatedValue,
}: {
  variant: TabKey;
  animatedValue: Animated.Value;
}) {
  let colorsBottom: string[];
  if (variant === 'overview') {
    colorsBottom = ['#022C22', '#064E3B'];
  } else if (variant === 'students') {
    colorsBottom = ['#022C22', '#052E16'];
  } else {
    colorsBottom = ['#022C22', '#064E3B'];
  }
  const particleColor = variant === 'leaderboard' ? '#A3E635' : '#4ADE80';

  return (
    <View style={styles.backgroundLayer} pointerEvents="none">
      <LinearGradient
        colors={colorsBottom}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {PARTICLE_CONFIG.map((p, i) => {
        const translateX = animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [Math.sin(p.phase * Math.PI * 2) * 25, Math.sin(p.phase * Math.PI * 2 + 1) * 35],
        });
        const translateY = animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [Math.cos(p.phase * Math.PI * 2) * 20, Math.cos(p.phase * Math.PI * 2 + 1) * -30],
        });
        const opacity = animatedValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.25 + p.phase * 0.2, 0.6, 0.25 + p.phase * 0.2],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.backgroundParticle,
              {
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                borderRadius: p.size / 2,
                backgroundColor: particleColor,
                transform: [{ translateX }, { translateY }],
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

function StudentDetailModal({
  visible,
  onClose,
  student,
  scores,
  achievements,
  loading,
  onFetchAttemptDetails,
}: {
  visible: boolean;
  onClose: () => void;
  student: AdminUserSummary;
  scores: ScoreRecord[];
  achievements: AchievementRecord[];
  loading: boolean;
  onFetchAttemptDetails?: (scoreId: string) => Promise<QuizAnswerDetail[]>;
}) {
  const name = student.username || student.displayName || student.email;
  const initial = (name || '?').charAt(0).toUpperCase();
  const [expandedScoreId, setExpandedScoreId] = React.useState<string | null>(null);
  const [attemptDetailsByScoreId, setAttemptDetailsByScoreId] = React.useState<Record<string, QuizAnswerDetail[] | null>>({});
  const [loadingScoreId, setLoadingScoreId] = React.useState<string | null>(null);

  const handleScorePress = (scoreId: string) => {
    if (!onFetchAttemptDetails) return;
    if (expandedScoreId === scoreId) {
      setExpandedScoreId(null);
      return;
    }
    setExpandedScoreId(scoreId);
    if (attemptDetailsByScoreId[scoreId] !== undefined) return;
    setLoadingScoreId(scoreId);
    onFetchAttemptDetails(scoreId)
      .then((details) => {
        setAttemptDetailsByScoreId((prev) => ({ ...prev, [scoreId]: details }));
      })
      .finally(() => setLoadingScoreId(null));
  };

  React.useEffect(() => {
    if (!visible) {
      setExpandedScoreId(null);
      setAttemptDetailsByScoreId({});
      setLoadingScoreId(null);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.modalAvatar}>
              <Text style={styles.modalAvatarText}>{initial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>{name}</Text>
              <Text style={styles.modalSubtitle}>{student.email}</Text>
            </View>
            {Platform.OS === 'web' && (
              <TouchableOpacity
                onPress={() => openPrintReport(student, scores, achievements)}
                style={styles.printReportButton}
                activeOpacity={0.8}
              >
                <Text style={styles.printReportButtonText}>📄 Print Report</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="small" color="#FF6600" />
              <Text style={styles.loadingText}>Loading student details…</Text>
            </View>
          ) : (
            <ScrollView
              style={{ maxHeight: 520 }}
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalSectionCard}>
                <Text style={styles.modalSectionTitle}>Overview</Text>
                <Text style={styles.modalOverviewText}>
                  Joined {student.createdAt.slice(0, 10)} · Overall progress {student.combinedProgress}% · Quizzes {student.quizzesTaken}
                  {student.streak != null ? ` · Streak ${student.streak} day(s)` : ''}
                </Text>
              </View>

              <View style={styles.modalSectionCard}>
                <Text style={styles.modalSectionTitle}>Progress by Topic</Text>
                <View style={styles.topicProgressList}>
                  {Object.entries(student.topicProgress || {}).map(([tid, value]) => {
                    const topicId = Number(tid);
                    const label = TOPIC_LABELS[topicId] || `Topic ${topicId}`;
                    const pct = value ?? 0;
                    return (
                      <View key={tid} style={styles.topicProgressRow}>
                        <View style={styles.topicProgressHeader}>
                          <Text style={styles.topicName}>{label}</Text>
                          <Text style={styles.topicProgressText}>{pct}%</Text>
                        </View>
                        <View style={styles.topicProgressBarBackground}>
                          <View
                            style={[
                              styles.topicProgressBarFill,
                              { width: `${Math.max(0, Math.min(100, pct))}%` },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })}
                  {Object.keys(student.topicProgress || {}).length === 0 && (
                    <Text style={styles.mutedText}>No topic progress recorded yet.</Text>
                  )}
                </View>
              </View>

              <View style={styles.modalSectionCard}>
                <Text style={styles.modalSectionTitle}>Recent Quiz Scores</Text>
                {scores.length === 0 ? (
                  <Text style={styles.mutedText}>No quiz attempts yet.</Text>
                ) : (
                  <View style={styles.scoreList}>
                    {scores.slice(0, 10).map((s) => {
                      const topicName = TOPIC_LABELS[s.topicId] ?? `Topic ${s.topicId}`;
                      const isExpanded = expandedScoreId === s.id;
                      const details = attemptDetailsByScoreId[s.id];
                      const isLoading = loadingScoreId === s.id;
                      return (
                        <View key={s.id} style={styles.accordionItem}>
                          <TouchableOpacity
                            style={[styles.scoreRow, isExpanded && styles.scoreRowExpanded]}
                            onPress={() => onFetchAttemptDetails && handleScorePress(s.id)}
                            activeOpacity={onFetchAttemptDetails ? 0.7 : 1}
                            disabled={!onFetchAttemptDetails}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={styles.scoreTitle}>
                                {topicName}
                                {s.difficulty ? ` · ${s.difficulty.toUpperCase()}` : ''}
                              </Text>
                              <Text style={styles.scoreMeta}>
                                {s.score}/{s.total} ({Math.round((s.score / s.total) * 100)}%) · {s.completedAt.slice(0, 10)}
                              </Text>
                              {onFetchAttemptDetails && (
                                <Text style={styles.scoreTapHint}>
                                  {isExpanded ? '▼ Hide summary' : '▶ View summary'}
                                </Text>
                              )}
                            </View>
                          </TouchableOpacity>
                          {isExpanded && (
                            <View style={styles.attemptSummaryBlock}>
                              {isLoading ? (
                                <ActivityIndicator size="small" color="#10B981" style={{ marginVertical: getSpacing(Spacing.md) }} />
                              ) : details && details.length > 0 ? (
                                <View style={styles.attemptSummaryList}>
                                  {details.map((a, i) => (
                                    <View key={i} style={styles.attemptSummaryRow}>
                                      <Text style={styles.attemptSummaryQ} numberOfLines={2}>
                                        Q{i + 1}: {a.questionText ?? `Question ${i + 1}`}
                                      </Text>
                                      <Text style={a.isCorrect ? styles.attemptSummaryCorrect : styles.attemptSummaryWrong}>
                                        {a.isCorrect ? '✓' : '✗'} Your answer: {a.selectedAnswer || '—'}
                                      </Text>
                                      {!a.isCorrect && (
                                        <Text style={styles.attemptSummaryCorrectAnswer}>
                                          Correct: {a.correctAnswer}
                                        </Text>
                                      )}
                                    </View>
                                  ))}
                                </View>
                              ) : (
                                <Text style={styles.mutedText}>No answer details saved for this attempt.</Text>
                              )}
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>

              <View style={styles.modalSectionCard}>
                <Text style={styles.modalSectionTitle}>Achievements</Text>
                {achievements.length === 0 ? (
                  <Text style={styles.mutedText}>No achievements unlocked yet.</Text>
                ) : (
                  <View style={styles.achievementList}>
                    {achievements.map((a) => {
                      const { title, icon, color } = getAchievementDisplay(a.id);
                      const dateStr = a.unlockedAt
                        ? new Date(a.unlockedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '';
                      return (
                        <View key={a.id} style={styles.achievementCard}>
                          <View style={[styles.achievementIconWrap, { backgroundColor: `${color}30` }]}>
                            <Text style={styles.achievementIcon}>{icon}</Text>
                          </View>
                          <View style={styles.achievementCardContent}>
                            <Text style={styles.achievementCardTitle}>{title}</Text>
                            {dateStr ? (
                              <Text style={styles.achievementCardDate}>Unlocked {dateStr}</Text>
                            ) : null}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

function SetPasswordModal({
  visible,
  request,
  user,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  request: PasswordResetRequest;
  user?: AdminUserSummary;
  onClose: () => void;
  onSuccess: (requestId: string) => void;
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const displayName = user?.username || user?.displayName || user?.email || request.identifier;

  const handleSubmit = async () => {
    setError('');
    if (!user?.id) {
      setError('User not found. The student may have used an identifier we could not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await adminSetPassword(user.id, newPassword);
      await completePasswordResetRequest(request.id);
      onSuccess(request.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to set password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.logoutConfirmOverlay}>
        <View style={styles.logoutConfirmCard}>
          <Text style={styles.logoutConfirmTitle}>Set password for student</Text>
          <Text style={styles.logoutConfirmMessage}>
            {displayName} ({request.identifier}) requested a password reset. Enter the new password below. Tell the student in person.
          </Text>
          <TextInput
            style={[styles.searchBarInput, { marginBottom: getSpacing(Spacing.sm) }]}
            placeholder="New password (min 6 characters)"
            placeholderTextColor="#9CA3AF"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <TextInput
            style={[styles.searchBarInput, { marginBottom: getSpacing(Spacing.sm) }]}
            placeholder="Confirm password"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={[styles.logoutConfirmActions, { marginTop: getSpacing(Spacing.md) }]}>
            <TouchableOpacity style={styles.logoutConfirmCancel} onPress={onClose}>
              <Text style={styles.logoutConfirmCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.setPasswordConfirmButton, (!user?.id || loading) && styles.setPasswordConfirmDisabled]}
              onPress={handleSubmit}
              disabled={!user?.id || loading}
            >
              <Text style={styles.logoutConfirmOkText}>
                {loading ? 'Setting…' : 'Set password'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function TabButton({
  label,
  tab,
  activeTab,
  onPress,
}: {
  label: string;
  tab: TabKey;
  activeTab: TabKey;
  onPress: (tab: TabKey) => void;
}) {
  const active = activeTab === tab;
  return (
    <TouchableOpacity
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={() => onPress(tab)}
      activeOpacity={0.8}
    >
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function OverviewTab({
  overview,
  users,
  onStudentPress,
  searchQuery,
  onSearchChange,
  narrow,
}: {
  overview: AdminOverview;
  users: AdminUserSummary[];
  onStudentPress: (user: AdminUserSummary) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  narrow?: boolean;
}) {
  const filteredUsers = filterUsersByName(users, searchQuery);
  const topActive = [...users]
    .filter((u) => u.lastActivityDate)
    .sort((a, b) => (b.lastActivityDate || '').localeCompare(a.lastActivityDate || ''))
    .slice(0, 5);

  return (
    <View style={styles.section}>
      <Text style={styles.overviewPageTitle}>Classroom overview</Text>
      <Text style={styles.overviewPageSubtitle}>
        Monitor student progress, quiz performance, and achievements in one place.
      </Text>
      <View style={[styles.cardRow, narrow && styles.cardRowMobileWeb]}>
        <View style={[styles.statCard, styles.statCardPrimary, narrow && styles.statCardMobileWeb]}>
          <View style={styles.statCardTopRow}>
            <View style={[styles.statIconChip, styles.statIconChipPrimary]}>
              <Text style={styles.statIconText}>👥</Text>
            </View>
            <Text style={[styles.statLabel, styles.statLabelPrimary]}>Total Students</Text>
          </View>
          <Text style={[styles.statValue, styles.statValuePrimary]}>{overview.totalStudents}</Text>
          <Text style={[styles.statSubLabel, styles.statSubLabelPrimary]}>All registered learners</Text>
        </View>
        <View style={[styles.statCard, styles.statCardSecondary, narrow && styles.statCardMobileWeb]}>
          <View style={styles.statCardTopRow}>
            <View style={[styles.statIconChip, styles.statIconChipSecondary]}>
              <Text style={styles.statIconText}>📈</Text>
            </View>
            <Text style={[styles.statLabel, styles.statLabelSecondary]}>Avg Progress</Text>
          </View>
          <Text style={[styles.statValue, styles.statValueSecondary]}>{overview.avgCombinedProgress}%</Text>
          <Text style={[styles.statSubLabel, styles.statSubLabelSecondary]}>Across all topics</Text>
        </View>
        <View style={[styles.statCard, styles.statCardTertiary, narrow && styles.statCardMobileWeb]}>
          <View style={styles.statCardTopRow}>
            <View style={[styles.statIconChip, styles.statIconChipTertiary]}>
              <Text style={styles.statIconText}>🎯</Text>
            </View>
            <Text style={[styles.statLabel, styles.statLabelTertiary]}>Total Quizzes Taken</Text>
          </View>
          <Text style={[styles.statValue, styles.statValueTertiary]}>{overview.totalQuizzesTaken}</Text>
          <Text style={[styles.statSubLabel, styles.statSubLabelTertiary]}>Completed activities</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>All Students</Text>
        <View style={[styles.searchBarWrap, narrow && styles.searchBarWrapMobileWeb]}>
          <TextInput
            style={styles.searchBarInput}
            placeholder="Search by name or email..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>
        {users.length === 0 ? (
          <Text style={styles.mutedText}>No students have registered yet.</Text>
        ) : filteredUsers.length === 0 ? (
          <Text style={styles.mutedText}>No students match your search.</Text>
        ) : (
          <View style={[styles.studentGrid, narrow && styles.studentGridMobileWeb]}>
            {filteredUsers.map((u) => {
              const name = u.username || u.displayName || u.email;
              const initial = (name || '?').charAt(0).toUpperCase();
              const photo = u.photoUrl;
              return (
                <View key={u.id} style={[styles.studentCardWrap, narrow && styles.studentCardWrapMobileWeb]}>
                  <TouchableOpacity
                    style={styles.studentCard}
                    activeOpacity={0.85}
                    onPress={() => onStudentPress(u)}
                  >
                  <View style={styles.studentAvatarWrap}>
                    {photo ? (
                      <Image source={{ uri: photo }} style={styles.studentAvatarImage} />
                    ) : (
                      <View style={styles.studentAvatarFallback}>
                        <Text style={styles.studentAvatarInitial}>{initial}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.studentCardName} numberOfLines={1}>
                    {name}
                  </Text>
                  <Text style={styles.studentCardEmail} numberOfLines={1}>
                    {u.email}
                  </Text>
                  <View style={styles.studentCardProgressRow}>
                    <Text style={styles.studentCardProgressText}>{u.combinedProgress}%</Text>
                    <View style={styles.studentCardProgressBarBackground}>
                      <View
                        style={[
                          styles.studentCardProgressBarFill,
                          { width: `${Math.max(0, Math.min(100, u.combinedProgress))}%` },
                        ]}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

function StudentsTab({
  users,
  searchQuery,
  onSearchChange,
  passwordResetRequests,
  passwordResetRequestsLoading,
  onRefreshRequests,
  onSetPassword,
  narrow,
}: {
  users: AdminUserSummary[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  passwordResetRequests: PasswordResetRequest[];
  passwordResetRequestsLoading: boolean;
  onRefreshRequests: () => void;
  onSetPassword: (request: PasswordResetRequest, user?: AdminUserSummary) => void;
  narrow?: boolean;
}) {
  const filteredUsers = filterUsersByName(users, searchQuery);

  return (
    <View style={styles.section}>
      {passwordResetRequests.length > 0 ? (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Password reset requests</Text>
          <Text style={[styles.mutedText, { marginBottom: getSpacing(Spacing.sm) }]}>
            Students who clicked Forgot Password. Set a new password and tell them in person.
          </Text>
          {passwordResetRequestsLoading ? (
            <ActivityIndicator size="small" color="#10B981" />
          ) : (
            <View style={styles.resetRequestList}>
              {passwordResetRequests.map((req) => {
                const user = req.userId ? users.find((u) => u.id === req.userId) : undefined;
                return (
                  <View key={req.id} style={[styles.resetRequestRow, narrow && styles.resetRequestRowMobileWeb]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resetRequestIdentifier}>{req.identifier}</Text>
                      <Text style={styles.resetRequestMeta}>
                        {req.requestedAt.slice(0, 16).replace('T', ' ')}
                        {user ? ` · ${user.username || user.email}` : ' · User not found'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.setPasswordButton, !user && styles.setPasswordButtonDisabled]}
                      onPress={() => onSetPassword(req, user)}
                      disabled={!user}
                    >
                      <Text style={styles.setPasswordButtonText}>
                        {user ? 'Set password' : 'N/A'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>All students</Text>
      <View style={[styles.studentsTabSearchRow, narrow && styles.studentsTabSearchRowMobileWeb]}>
        <View style={{ flex: 1 }} />
        <View style={[styles.searchBarWrap, narrow && styles.searchBarWrapMobileWeb]}>
          <TextInput
            style={styles.searchBarInput}
            placeholder="Search by name or email..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>
      </View>
      {!users.length ? (
        <Text style={styles.mutedText}>No students found yet.</Text>
      ) : narrow ? (
        filteredUsers.length === 0 ? (
          <Text style={styles.mutedText}>No students match your search.</Text>
        ) : (
        <View style={styles.studentCardListMobileWeb}>
          {filteredUsers.map((u) => (
            <View key={u.id} style={styles.studentCardMobileWeb}>
              <View style={styles.studentCardMobileWebHeader}>
                <Text style={styles.studentCardMobileWebName} numberOfLines={1}>
                  {u.username || u.displayName || u.email}
                </Text>
                <Text style={styles.studentCardMobileWebEmail} numberOfLines={1}>
                  {u.email}
                </Text>
              </View>
              <View style={styles.studentCardMobileWebStats}>
                <View style={styles.studentCardMobileWebStat}>
                  <Text style={styles.studentCardMobileWebStatLabel}>Progress</Text>
                  <Text style={styles.studentCardMobileWebStatValue}>{u.combinedProgress}%</Text>
                </View>
                <View style={styles.studentCardMobileWebStat}>
                  <Text style={styles.studentCardMobileWebStatLabel}>Avg Score</Text>
                  <Text style={styles.studentCardMobileWebStatValue}>{u.avgScore || '—'}%</Text>
                </View>
                <View style={styles.studentCardMobileWebStat}>
                  <Text style={styles.studentCardMobileWebStatLabel}>Quizzes</Text>
                  <Text style={styles.studentCardMobileWebStatValue}>{u.quizzesTaken}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        )
      ) : (
      <View style={styles.tableCard}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Student</Text>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Email</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Progress</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Avg Score</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Quizzes</Text>
        </View>
        {filteredUsers.map((u, index) => (
          <View
            key={u.id}
            style={[
              styles.tableRow,
              index % 2 === 1 && styles.tableRowAlt,
            ]}
          >
            <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>
              {u.username || u.displayName || u.email}
            </Text>
            <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>
              {u.email}
            </Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{u.combinedProgress}%</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{u.avgScore || '—'}%</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{u.quizzesTaken}</Text>
          </View>
        ))}
        {filteredUsers.length === 0 && (
          <Text style={[styles.mutedText, styles.tableEmptyText]}>
            No students match your search.
          </Text>
        )}
      </View>
      )}
    </View>
  );
}

function LeaderboardTab({
  byProgress,
  byScore,
  narrow,
}: {
  byProgress: AdminUserSummary[];
  byScore: AdminUserSummary[];
  narrow?: boolean;
}) {
  const shineAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(shineAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shineAnim]);
  const shineTranslate = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-400, 400],
  });
  const shineOpacity = shineAnim.interpolate({
    inputRange: [0, 0.45, 0.5, 0.55, 1],
    outputRange: [0, 0.35, 0.5, 0.35, 0],
  });

  return (
    <View style={[styles.leaderboardRow, narrow && styles.leaderboardRowMobileWeb]}>
      <View style={[styles.sectionCard, styles.leaderboardColumn, styles.leaderboardCardShineWrap]}>
        <Animated.View
          style={[
            styles.leaderboardShine,
            { transform: [{ translateX: shineTranslate }], opacity: shineOpacity },
          ]}
        />
        <Text style={styles.sectionTitle}>Top Students by Progress</Text>
        {byProgress.slice(0, 10).map((u, idx) => (
          <View key={u.id} style={styles.leaderRow}>
            <View style={styles.leaderRankChip}>
              <Text style={styles.leaderRank}>{idx + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.leaderName}>{u.username || u.displayName || u.email}</Text>
              <Text style={styles.leaderMeta}>
                Overall progress {u.combinedProgress}% · {u.quizzesTaken} quizzes
              </Text>
              <View style={styles.leaderBarBackground}>
                <View
                  style={[
                    styles.leaderBarFillPrimary,
                    { width: `${Math.max(0, Math.min(100, u.combinedProgress))}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.sectionCard, styles.leaderboardColumn, styles.leaderboardCardShineWrap]}>
        <Animated.View
          style={[
            styles.leaderboardShine,
            { transform: [{ translateX: shineTranslate }], opacity: shineOpacity },
          ]}
        />
        <Text style={styles.sectionTitle}>Top Students by Average Quiz Score</Text>
        {byScore.length === 0 ? (
          <Text style={styles.mutedText}>No quiz attempts yet.</Text>
        ) : (
          byScore.map((u, idx) => (
            <View key={u.id} style={styles.leaderRow}>
              <View style={styles.leaderRankChipSecondary}>
                <Text style={styles.leaderRank}>{idx + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.leaderName}>{u.username || u.displayName || u.email}</Text>
                <Text style={styles.leaderMeta}>
                  Avg score {u.avgScore}% · Best {u.bestScore}% · {u.quizzesTaken} quizzes
                </Text>
                <View style={styles.leaderBarBackground}>
                  <View
                    style={[
                      styles.leaderBarFillSecondary,
                      { width: `${Math.max(0, Math.min(100, u.avgScore || 0))}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#022C22',
  },
  header: {
    paddingHorizontal: getSpacing(Spacing.lg),
    paddingTop: getSpacing(Spacing.lg),
    paddingBottom: getSpacing(Spacing.md),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: scaleFont(28),
    fontWeight: '800',
    color: '#ECFDF5',
    letterSpacing: 0.5,
  },
  logoutButton: {
    paddingHorizontal: getSpacing(Spacing.lg),
    paddingVertical: getSpacing(Spacing.sm),
    borderRadius: scaleSize(12),
    backgroundColor: '#B91C1C',
    borderWidth: 0,
  },
  logoutButtonText: {
    fontSize: scaleFont(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoutConfirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: getSpacing(Spacing.lg),
  },
  logoutConfirmCard: {
    backgroundColor: '#0f172a',
    borderRadius: scaleSize(16),
    padding: getSpacing(Spacing.xl),
    maxWidth: 360,
    width: '100%',
  },
  logoutConfirmTitle: {
    fontSize: scaleFont(20),
    fontWeight: '700',
    color: '#ECFDF5',
    marginBottom: getSpacing(Spacing.sm),
  },
  logoutConfirmMessage: {
    fontSize: scaleFont(14),
    color: '#A7F3D0',
    marginBottom: getSpacing(Spacing.lg),
  },
  logoutConfirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: getSpacing(Spacing.sm),
  },
  logoutConfirmCancel: {
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.lg),
    borderRadius: scaleSize(12),
    backgroundColor: '#334155',
  },
  logoutConfirmCancelText: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#E2E8F0',
  },
  logoutConfirmOk: {
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.lg),
    borderRadius: scaleSize(12),
    backgroundColor: '#B91C1C',
  },
  setPasswordConfirmButton: {
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.lg),
    borderRadius: scaleSize(12),
    backgroundColor: '#10B981',
  },
  setPasswordConfirmDisabled: {
    opacity: 0.5,
  },
  logoutConfirmOkText: {
    fontSize: scaleFont(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  backButton: {
    paddingHorizontal: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.xs),
    borderRadius: scaleSize(999),
    borderWidth: 1,
    borderColor: '#10B981',
    backgroundColor: '#022C22',
  },
  backButtonText: {
    fontSize: scaleFont(13),
    color: '#6EE7B7',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: getSpacing(Spacing.lg),
    paddingBottom: getSpacing(Spacing.sm),
    gap: getSpacing(Spacing.sm),
  },
  tabButton: {
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.lg),
    borderRadius: scaleSize(999),
    backgroundColor: '#E5E7EB',
  },
  tabButtonActive: {
    backgroundColor: '#10B981',
  },
  tabButtonText: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#022C22',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  backgroundParticle: {
    position: 'absolute',
  },
  contentInner: {
    paddingHorizontal: getSpacing(Spacing.lg),
    paddingBottom: getSpacing(Spacing.xxl),
    gap: getSpacing(Spacing.lg),
  },
  contentInnerMobileWeb: {
    paddingHorizontal: getSpacing(Spacing.md),
  },
  section: {
    gap: getSpacing(Spacing.lg),
  },
  leaderboardRow: {
    flexDirection: 'row',
    gap: getSpacing(Spacing.lg),
  },
  leaderboardColumn: {
    flex: 1,
  },
  cardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getSpacing(Spacing.md),
  },
  statCard: {
    flex: 1,
    minWidth: 160,
    borderRadius: scaleSize(16),
    padding: getSpacing(Spacing.lg),
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  statCardPrimary: {
    backgroundColor: '#E0F2FE',
    borderTopWidth: 4,
    borderTopColor: '#0284C7',
  },
  statCardSecondary: {
    backgroundColor: '#D1FAE5',
    borderTopWidth: 4,
    borderTopColor: '#059669',
  },
  statCardTertiary: {
    backgroundColor: '#EDE9FE',
    borderTopWidth: 4,
    borderTopColor: '#7C3AED',
  },
  statLabelPrimary: {
    color: '#0369A1',
  },
  statValuePrimary: {
    color: '#0C4A6E',
  },
  statSubLabelPrimary: {
    color: '#0E7490',
  },
  statLabelSecondary: {
    color: '#047857',
  },
  statValueSecondary: {
    color: '#064E3B',
  },
  statSubLabelSecondary: {
    color: '#065F46',
  },
  statLabelTertiary: {
    color: '#5B21B6',
  },
  statValueTertiary: {
    color: '#4C1D95',
  },
  statSubLabelTertiary: {
    color: '#6D28D9',
  },
  statCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: getSpacing(Spacing.sm),
  },
  statIconChip: {
    width: scaleSize(32),
    height: scaleSize(32),
    borderRadius: scaleSize(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconChipPrimary: {
    backgroundColor: '#ECFDF5',
  },
  statIconChipSecondary: {
    backgroundColor: '#DCFCE7',
  },
  statIconChipTertiary: {
    backgroundColor: '#D1FAE5',
  },
  statIconText: {
    fontSize: scaleFont(16),
  },
  statLabel: {
    fontSize: scaleFont(13),
    color: '#D1FAE5',
    marginBottom: getSpacing(Spacing.xs),
  },
  statValue: {
    fontSize: scaleFont(24),
    fontWeight: '700',
    color: '#ECFDF5',
  },
  statSubLabel: {
    marginTop: getSpacing(Spacing.xs),
    fontSize: scaleFont(12),
    color: '#A7F3D0',
  },
  sectionCard: {
    backgroundColor: 'rgba(15,118,110,0.85)',
    borderRadius: scaleSize(16),
    padding: getSpacing(Spacing.lg),
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    gap: getSpacing(Spacing.sm),
  },
  leaderboardCardShineWrap: {
    overflow: 'hidden',
  },
  leaderboardShine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 120,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  sectionTitle: {
    fontSize: scaleFont(18),
    fontWeight: '700',
    color: '#ECFDF5',
    marginBottom: getSpacing(Spacing.xs),
  },
  searchBarWrap: {
    marginTop: getSpacing(Spacing.sm),
    marginBottom: getSpacing(Spacing.md),
    maxWidth: 280,
  },
  searchBarInput: {
    backgroundColor: '#ECFDF5',
    borderRadius: scaleSize(12),
    paddingHorizontal: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.sm),
    fontSize: scaleFont(14),
    color: '#022C22',
  },
  mutedText: {
    fontSize: scaleFont(14),
    color: '#A7F3D0',
  },
  overviewPageTitle: {
    fontSize: scaleFont(20),
    fontWeight: '700',
    color: '#ECFDF5',
    marginBottom: getSpacing(Spacing.xs),
  },
  overviewPageSubtitle: {
    fontSize: scaleFont(13),
    color: '#A7F3D0',
    marginBottom: getSpacing(Spacing.md),
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.sm),
    borderRadius: scaleSize(999),
    marginTop: getSpacing(Spacing.xs),
    backgroundColor: '#F9FAFB',
  },
  recentAvatar: {
    width: scaleSize(32),
    height: scaleSize(32),
    borderRadius: scaleSize(16),
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getSpacing(Spacing.sm),
  },
  recentAvatarText: {
    fontSize: scaleFont(14),
    fontWeight: '700',
    color: '#15803D',
  },
  recentName: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#022C22',
  },
  recentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getSpacing(Spacing.xs),
  },
  recentMeta: {
    fontSize: scaleFont(12),
    color: '#4B5563',
  },
  recentPill: {
    paddingHorizontal: getSpacing(Spacing.sm),
    paddingVertical: getSpacing(Spacing.xs),
    borderRadius: scaleSize(999),
    backgroundColor: '#DCFCE7',
  },
  recentPillText: {
    fontSize: scaleFont(11),
    fontWeight: '500',
    color: '#15803D',
  },
  recentDate: {
    fontSize: scaleFont(12),
    color: '#4B5563',
    marginLeft: getSpacing(Spacing.md),
  },
  studentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: getSpacing(Spacing.sm),
  },
  studentCardWrap: {
    width: '25%',
    padding: getSpacing(Spacing.lg),
    paddingBottom: 0,
    marginBottom: getSpacing(Spacing.lg),
  },
  studentCard: {
    paddingHorizontal: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.md),
    borderRadius: scaleSize(14),
    backgroundColor: '#F9FAFB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  studentAvatarWrap: {
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.xs),
  },
  studentAvatarImage: {
    width: scaleSize(72),
    height: scaleSize(72),
    borderRadius: scaleSize(36),
    backgroundColor: '#E5E7EB',
  },
  studentAvatarFallback: {
    width: scaleSize(72),
    height: scaleSize(72),
    borderRadius: scaleSize(36),
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentAvatarInitial: {
    fontSize: scaleFont(22),
    fontWeight: '700',
    color: '#4B5563',
  },
  studentCardName: {
    marginTop: getSpacing(Spacing.xxxs),
    fontSize: scaleFont(13),
    fontWeight: '600',
    color: '#022C22',
    textAlign: 'center',
  },
  studentCardEmail: {
    fontSize: scaleFont(11),
    color: '#4B5563',
    textAlign: 'center',
  },
  studentCardProgressRow: {
    marginTop: getSpacing(Spacing.xxxs),
  },
  studentCardProgressText: {
    fontSize: scaleFont(11),
    color: '#065F46',
    textAlign: 'center',
  },
  studentCardProgressBarBackground: {
    marginTop: getSpacing(Spacing.xxxs),
    height: scaleSize(8),
    borderRadius: scaleSize(999),
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  studentCardProgressBarFill: {
    height: '100%',
    borderRadius: scaleSize(999),
    backgroundColor: '#22C55E',
  },
  studentsTabSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: getSpacing(Spacing.md),
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scaleSize(16),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: getSpacing(Spacing.md),
    paddingHorizontal: getSpacing(Spacing.md),
    backgroundColor: '#0F766E',
  },
  tableHeaderCell: {
    fontSize: scaleFont(14),
    fontWeight: '700',
    color: '#ECFDF5',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.md),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  tableRowAlt: {
    backgroundColor: '#F0FDF4',
  },
  tableRowSelected: {
    backgroundColor: '#ECFDF5',
    borderLeftWidth: 3,
    borderLeftColor: '#22C55E',
  },
  tableCell: {
    fontSize: scaleFont(13),
    color: '#111827',
    paddingRight: getSpacing(Spacing.sm),
  },
  tableEmptyText: {
    paddingVertical: getSpacing(Spacing.lg),
    paddingHorizontal: getSpacing(Spacing.md),
  },
  resetRequestList: {
    gap: getSpacing(Spacing.sm),
  },
  resetRequestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.md),
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: scaleSize(12),
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  resetRequestRowMobileWeb: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: getSpacing(Spacing.sm),
  },
  resetRequestIdentifier: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#ECFDF5',
  },
  resetRequestMeta: {
    fontSize: scaleFont(12),
    color: '#A7F3D0',
    marginTop: 2,
  },
  setPasswordButton: {
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.md),
    borderRadius: scaleSize(10),
    backgroundColor: '#10B981',
  },
  setPasswordButtonDisabled: {
    backgroundColor: '#6B7280',
    opacity: 0.7,
  },
  setPasswordButtonText: {
    fontSize: scaleFont(13),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getSpacing(Spacing.xs),
  },
  leaderRank: {
    fontSize: scaleFont(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  leaderRankChip: {
    width: scaleSize(28),
    height: scaleSize(28),
    borderRadius: scaleSize(14),
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getSpacing(Spacing.sm),
  },
  leaderRankChipSecondary: {
    width: scaleSize(28),
    height: scaleSize(28),
    borderRadius: scaleSize(14),
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getSpacing(Spacing.sm),
  },
  leaderName: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#ECFDF5',
  },
  leaderMeta: {
    fontSize: scaleFont(12),
    color: '#A7F3D0',
  },
  leaderBarBackground: {
    marginTop: getSpacing(Spacing.xs),
    height: scaleSize(6),
    borderRadius: scaleSize(999),
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  leaderBarFillPrimary: {
    height: '100%',
    borderRadius: scaleSize(999),
    backgroundColor: '#16A34A',
  },
  leaderBarFillSecondary: {
    height: '100%',
    borderRadius: scaleSize(999),
    backgroundColor: '#22C55E',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getSpacing(Spacing.md),
  },
  modalCard: {
    width: '100%',
    maxWidth: 720,
    borderRadius: 20,
    backgroundColor: '#0f172a',
    padding: getSpacing(Spacing.md),
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.sm),
  },
  modalAvatar: {
    width: scaleSize(40),
    height: scaleSize(40),
    borderRadius: scaleSize(20),
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing(Spacing.sm),
  },
  modalAvatarText: {
    color: 'white',
    fontSize: scaleFont(18),
    fontWeight: '700',
  },
  modalTitle: {
    color: 'white',
    fontSize: scaleFont(18),
    fontWeight: '600',
  },
  modalSubtitle: {
    color: '#9CA3AF',
    fontSize: scaleFont(13),
  },
  printReportButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.sm),
    borderRadius: scaleSize(8),
    marginRight: getSpacing(Spacing.sm),
  },
  printReportButtonText: {
    color: '#fff',
    fontSize: scaleFont(13),
    fontWeight: '600',
  },
  modalCloseButton: {
    paddingHorizontal: getSpacing(Spacing.xs),
    paddingVertical: getSpacing(Spacing.xs),
    marginLeft: getSpacing(Spacing.xs),
  },
  modalCloseText: {
    color: '#9CA3AF',
    fontSize: scaleFont(18),
  },
  modalContent: {
    paddingTop: getSpacing(Spacing.sm),
    paddingBottom: getSpacing(Spacing.xs),
    gap: getSpacing(Spacing.md),
  },
  modalSectionCard: {
    backgroundColor: 'rgba(30,41,59,0.6)',
    borderRadius: scaleSize(12),
    padding: getSpacing(Spacing.md),
    borderWidth: 1,
    borderColor: 'rgba(71,85,105,0.4)',
  },
  modalSectionTitle: {
    color: '#E5E7EB',
    fontSize: scaleFont(15),
    fontWeight: '700',
    marginBottom: getSpacing(Spacing.sm),
  },
  modalOverviewText: {
    color: '#94A3B8',
    fontSize: scaleFont(13),
    lineHeight: 20,
  },
  scoreList: {
    gap: 0,
  },
  accordionItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148,163,184,0.2)',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.xs),
  },
  scoreRowExpanded: {
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderRadius: scaleSize(8),
  },
  scoreTitle: {
    color: '#F9FAFB',
    fontSize: scaleFont(13),
    fontWeight: '500',
  },
  scoreMeta: {
    color: '#9CA3AF',
    fontSize: scaleFont(12),
    marginTop: 2,
  },
  scoreTapHint: {
    color: '#6EE7B7',
    fontSize: scaleFont(11),
    marginTop: 2,
  },
  attemptSummaryBlock: {
    marginTop: getSpacing(Spacing.xs),
    marginBottom: getSpacing(Spacing.sm),
    marginHorizontal: getSpacing(Spacing.xs),
    padding: getSpacing(Spacing.md),
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderRadius: scaleSize(10),
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  attemptSummaryList: {
    gap: getSpacing(Spacing.sm),
  },
  attemptSummaryRow: {
    paddingVertical: getSpacing(Spacing.xs),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148,163,184,0.3)',
  },
  attemptSummaryQ: {
    color: '#E5E7EB',
    fontSize: scaleFont(12),
    marginBottom: 4,
  },
  attemptSummaryCorrect: {
    color: '#6EE7B7',
    fontSize: scaleFont(12),
  },
  attemptSummaryWrong: {
    color: '#FCA5A5',
    fontSize: scaleFont(12),
  },
  attemptSummaryCorrectAnswer: {
    color: '#A7F3D0',
    fontSize: scaleFont(11),
    marginTop: 2,
  },
  achievementList: {
    gap: getSpacing(Spacing.sm),
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(51,65,85,0.5)',
    borderRadius: scaleSize(12),
    padding: getSpacing(Spacing.sm),
    borderWidth: 1,
    borderColor: 'rgba(71,85,105,0.4)',
  },
  achievementIconWrap: {
    width: scaleSize(44),
    height: scaleSize(44),
    borderRadius: scaleSize(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getSpacing(Spacing.sm),
  },
  achievementIcon: {
    fontSize: scaleFont(22),
  },
  achievementCardContent: {
    flex: 1,
  },
  achievementCardTitle: {
    color: '#F1F5F9',
    fontSize: scaleFont(14),
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementCardDate: {
    color: '#94A3B8',
    fontSize: scaleFont(12),
  },
  topicProgressList: {
    marginTop: getSpacing(Spacing.md),
    gap: getSpacing(Spacing.sm),
  },
  topicProgressRow: {
    gap: getSpacing(Spacing.xs),
  },
  topicProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topicName: {
    fontSize: scaleFont(13),
    fontWeight: '600',
    color: '#ECFDF5',
  },
  topicProgressText: {
    fontSize: scaleFont(12),
    color: '#A7F3D0',
  },
  topicProgressBarBackground: {
    marginTop: getSpacing(Spacing.xs),
    height: scaleSize(6),
    borderRadius: scaleSize(999),
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  topicProgressBarFill: {
    height: '100%',
    borderRadius: scaleSize(999),
    backgroundColor: '#FF8A3C',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getSpacing(Spacing.lg),
  },
  loadingText: {
    marginTop: getSpacing(Spacing.md),
    fontSize: scaleFont(14),
    color: '#ECFDF5',
  },
  errorText: {
    fontSize: scaleFont(14),
    color: '#F97373',
    textAlign: 'center',
  },
  // Web mobile responsive (narrow viewport)
  headerMobileWeb: {
    flexWrap: 'wrap',
    paddingHorizontal: getSpacing(Spacing.md),
  },
  tabBarMobileWeb: {
    flexWrap: 'wrap',
    gap: getSpacing(Spacing.xs),
  },
  cardRowMobileWeb: {
    flexDirection: 'column',
  },
  statCardMobileWeb: {
    minWidth: '100%',
  },
  studentGridMobileWeb: {
    marginTop: getSpacing(Spacing.sm),
  },
  studentCardWrapMobileWeb: {
    width: '50%',
    padding: getSpacing(Spacing.sm),
    paddingBottom: 0,
    marginBottom: getSpacing(Spacing.md),
  },
  searchBarWrapMobileWeb: {
    maxWidth: '100%',
  },
  studentsTabSearchRowMobileWeb: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  leaderboardRowMobileWeb: {
    flexDirection: 'column',
  },
  studentCardListMobileWeb: {
    gap: getSpacing(Spacing.sm),
  },
  studentCardMobileWeb: {
    backgroundColor: '#FFFFFF',
    borderRadius: scaleSize(12),
    padding: getSpacing(Spacing.md),
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  studentCardMobileWebHeader: {
    marginBottom: getSpacing(Spacing.sm),
  },
  studentCardMobileWebName: {
    fontSize: scaleFont(15),
    fontWeight: '600',
    color: '#022C22',
  },
  studentCardMobileWebEmail: {
    fontSize: scaleFont(12),
    color: '#4B5563',
    marginTop: 2,
  },
  studentCardMobileWebStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getSpacing(Spacing.md),
  },
  studentCardMobileWebStat: {
    minWidth: 80,
  },
  studentCardMobileWebStatLabel: {
    fontSize: scaleFont(11),
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  studentCardMobileWebStatValue: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#022C22',
  },
});

