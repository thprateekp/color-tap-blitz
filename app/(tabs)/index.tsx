import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import {
  COLOR_OPTIONS,
  SESSION_SECONDS,
  makeRound,
  scoreHit,
  updateStats,
  type ColorId,
  type GameStats,
} from "@/lib/game";

const STATS_KEY = "color-tap-blitz.stats.v1";
const EMPTY_STATS: GameStats = { highScore: 0, bestCombo: 0, gamesPlayed: 0 };

type Phase = "home" | "playing" | "finished";
type Feedback = "hit" | "miss" | null;

function triggerHaptic(type: "light" | "success" | "error") {
  if (type === "light") {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } else {
    void Haptics.notificationAsync(
      type === "success"
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error,
    );
  }
}

export default function HomeScreen() {
  const [phase, setPhase] = useState<Phase>("home");
  const [target, setTarget] = useState<ColorId>("violet");
  const [timeLeft, setTimeLeft] = useState(SESSION_SECONDS);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [stats, setStats] = useState<GameStats>(EMPTY_STATS);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);

  useEffect(() => {
    void AsyncStorage.getItem(STATS_KEY).then((stored) => {
      if (!stored) return;
      try {
        setStats({ ...EMPTY_STATS, ...JSON.parse(stored) });
      } catch {
        setStats(EMPTY_STATS);
      }
    });
  }, []);

  function finishGame() {
    const nextStats = updateStats(stats, scoreRef.current, comboRef.current);
    setStats(nextStats);
    void AsyncStorage.setItem(STATS_KEY, JSON.stringify(nextStats));
    setPhase("finished");
    triggerHaptic("success");
  }

  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      finishGame();
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft((current) => Math.max(0, current - 0.1));
    }, 100);
    return () => clearTimeout(timer);
  }, [phase, timeLeft]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 280);
    return () => clearTimeout(timer);
  }, [feedback]);

  function startGame() {
    triggerHaptic("light");
    scoreRef.current = 0;
    comboRef.current = 0;
    setScore(0);
    setCombo(0);
    setTimeLeft(SESSION_SECONDS);
    setFeedback(null);
    setTarget(makeRound());
    setPhase("playing");
  }

  function tapColor(id: ColorId) {
    if (phase !== "playing") return;
    if (id === target) {
      const nextCombo = comboRef.current + 1;
      const nextScore = scoreRef.current + scoreHit(comboRef.current);
      comboRef.current = nextCombo;
      scoreRef.current = nextScore;
      setCombo(nextCombo);
      setScore(nextScore);
      setTimeLeft((current) => Math.min(SESSION_SECONDS, current + 0.2));
      setFeedback("hit");
      setTarget(makeRound());
      triggerHaptic("light");
      return;
    }

    comboRef.current = 0;
    setCombo(0);
    setTimeLeft((current) => Math.max(0, current - 0.75));
    setFeedback("miss");
    setTarget(makeRound());
    triggerHaptic("error");
  }

  const currentColor = useMemo(
    () => COLOR_OPTIONS.find((color) => color.id === target) ?? COLOR_OPTIONS[0],
    [target],
  );
  const timePercent = Math.max(0, Math.min(100, (timeLeft / SESSION_SECONDS) * 100));
  const title = phase === "home" ? "How fast is your focus?" : phase === "playing" ? "Find. Tap. Repeat." : "Blitz complete.";
  const subtitle = phase === "home" ? "A 20-second color reflex workout designed to sharpen attention and reaction speed." : phase === "playing" ? "Match the target swatch before the clock drains." : "Every correct tap stacked points. Ready for one more run?";

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]} className="bg-background">
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.logoMark}><Text style={styles.logoBolt}>ϟ</Text></View>
          <View style={styles.brandCopy}>
            <Text style={styles.eyebrow}>COLOR TAP BLITZ</Text>
            <Text style={styles.brandSubline}>{phase === "playing" ? "Live challenge" : "Reaction lab"}</Text>
          </View>
          <View style={styles.scorePill}>
            <Text style={styles.scorePillIcon}>◆</Text>
            <Text style={styles.scorePillText}>{phase === "playing" ? score : stats.highScore}</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroSubtitle}>{subtitle}</Text>
        </View>

        {phase === "home" ? (
          <>
            <View style={styles.statsRow}>
              <StatCard label="HIGH SCORE" value={`${stats.highScore}`} accent="#9B7BFF" />
              <StatCard label="BEST COMBO" value={`${stats.bestCombo}`} accent="#48E0B2" />
              <StatCard label="RUNS" value={`${stats.gamesPlayed}`} accent="#FFD166" />
            </View>

            <View style={styles.previewCard}>
              <View style={styles.previewTopline}>
                <Text style={styles.previewKicker}>THE RULE IS SIMPLE</Text>
                <Text style={styles.previewTime}>00:20</Text>
              </View>
              <View style={styles.previewPromptRow}>
                <View style={styles.previewTarget}><View style={[styles.colorDot, { backgroundColor: "#9B7BFF" }]} /></View>
                <View style={styles.previewCopy}>
                  <Text style={styles.previewTitle}>Tap the target color</Text>
                  <Text style={styles.previewBody}>Correct taps add time. Misses break your combo.</Text>
                </View>
              </View>
              <View style={styles.miniGrid}>
                {COLOR_OPTIONS.map((color) => <View key={color.id} style={[styles.miniSwatch, { backgroundColor: color.hex }]} />)}
              </View>
            </View>

            <Pressable onPress={startGame} style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
              <Text style={styles.primaryButtonText}>Start the blitz</Text>
              <Text style={styles.primaryButtonArrow}>→</Text>
            </Pressable>

            <View style={styles.tipRow}>
              <View style={styles.tipIcon}><Text style={styles.tipIconText}>✦</Text></View>
              <View style={styles.tipCopy}>
                <Text style={styles.tipTitle}>Quick tip</Text>
                <Text style={styles.tipBody}>Say the color in your head, not the position. Speed follows clarity.</Text>
              </View>
            </View>
          </>
        ) : phase === "playing" ? (
          <>
            <View style={styles.gameMetaRow}>
              <View><Text style={styles.metaLabel}>TIME LEFT</Text><Text style={styles.timerText}>{timeLeft.toFixed(1)}<Text style={styles.timerUnit}>s</Text></Text></View>
              <View style={styles.comboBox}><Text style={styles.comboLabel}>COMBO</Text><Text style={styles.comboValue}>{combo}×</Text></View>
            </View>
            <View style={styles.timerTrack}><View style={[styles.timerFill, { width: `${timePercent}%`, backgroundColor: timeLeft < 5 ? "#FF6B8A" : "#9B7BFF" }]} /></View>

            <View style={[styles.targetCard, feedback === "hit" && styles.targetCardHit, feedback === "miss" && styles.targetCardMiss]}>
              <Text style={styles.targetKicker}>TAP THE TARGET</Text>
              <Text style={styles.targetLabel}>{currentColor.label.toUpperCase()}</Text>
              <View style={[styles.targetOrb, { backgroundColor: currentColor.hex }]}>
                <Text style={styles.targetOrbGlyph}>{feedback === "hit" ? "✓" : feedback === "miss" ? "!" : "?"}</Text>
              </View>
              <Text style={styles.targetHint}>{feedback === "hit" ? "Nice hit" : feedback === "miss" ? "Combo reset" : "Trust your first read"}</Text>
            </View>

            <View style={styles.colorGrid}>
              {COLOR_OPTIONS.map((color) => (
                <Pressable key={color.id} onPress={() => tapColor(color.id)} style={({ pressed }) => [styles.colorButton, { backgroundColor: color.soft, borderColor: color.hex }, pressed && styles.colorButtonPressed]}>
                  <View style={[styles.colorButtonDot, { backgroundColor: color.hex }]} />
                  <Text style={[styles.colorButtonText, { color: color.hex }]}>{color.label}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.bottomHint}>Correct = +time · Miss = -0.75s</Text>
          </>
        ) : (
          <View style={styles.finishCard}>
            <View style={styles.finishBadge}><Text style={styles.finishBadgeText}>RUN COMPLETE</Text></View>
            <Text style={styles.finishScore}>{score}</Text>
            <Text style={styles.finishScoreLabel}>TOTAL POINTS</Text>
            <View style={styles.finishDivider} />
            <View style={styles.finishStatsRow}>
              <View><Text style={styles.finishStatValue}>{combo}×</Text><Text style={styles.finishStatLabel}>FINAL COMBO</Text></View>
              <View><Text style={styles.finishStatValue}>{stats.highScore}</Text><Text style={styles.finishStatLabel}>HIGH SCORE</Text></View>
            </View>
            <Pressable onPress={startGame} style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
              <Text style={styles.primaryButtonText}>Run it back</Text>
              <Text style={styles.primaryButtonArrow}>↻</Text>
            </Pressable>
            <Pressable onPress={() => setPhase("home")} style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}>
              <Text style={styles.secondaryButtonText}>Back to home</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return <View style={styles.statCard}><View style={[styles.statAccent, { backgroundColor: accent }]} /><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 42 },
  topBar: { flexDirection: "row", alignItems: "center" },
  logoMark: { width: 43, height: 43, borderRadius: 15, backgroundColor: "#9B7BFF", alignItems: "center", justifyContent: "center", transform: [{ rotate: "8deg" }] },
  logoBolt: { color: "#10131F", fontSize: 28, fontWeight: "900", transform: [{ rotate: "-8deg" }] },
  brandCopy: { flex: 1, marginLeft: 12 },
  eyebrow: { color: "#F7F5FF", fontSize: 11, fontWeight: "900", letterSpacing: 1.5 },
  brandSubline: { color: "#99A0B8", fontSize: 12, marginTop: 4 },
  scorePill: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20, backgroundColor: "#1B2032", paddingHorizontal: 12, paddingVertical: 8 },
  scorePillIcon: { color: "#FFD166", fontSize: 11 },
  scorePillText: { color: "#F7F5FF", fontSize: 13, fontWeight: "900" },
  hero: { marginTop: 42, marginBottom: 26 },
  heroTitle: { color: "#F7F5FF", fontSize: 36, lineHeight: 40, fontWeight: "900", letterSpacing: -1.6, maxWidth: 350 },
  heroSubtitle: { color: "#99A0B8", fontSize: 15, lineHeight: 22, marginTop: 12, maxWidth: 350 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 27 },
  statCard: { flex: 1, minHeight: 82, backgroundColor: "#1B2032", borderRadius: 16, padding: 13, overflow: "hidden" },
  statAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 3 },
  statValue: { color: "#F7F5FF", fontSize: 24, fontWeight: "900", marginTop: 4 },
  statLabel: { color: "#99A0B8", fontSize: 9, letterSpacing: 0.55, fontWeight: "900", marginTop: 7 },
  previewCard: { borderRadius: 20, backgroundColor: "#1B2032", padding: 17, borderWidth: 1, borderColor: "#303751" },
  previewTopline: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  previewKicker: { color: "#FFD166", fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  previewTime: { color: "#99A0B8", fontSize: 11, fontWeight: "800" },
  previewPromptRow: { flexDirection: "row", alignItems: "center", marginTop: 18 },
  previewTarget: { width: 46, height: 46, borderRadius: 16, backgroundColor: "#261E4A", alignItems: "center", justifyContent: "center" },
  colorDot: { width: 21, height: 21, borderRadius: 11 },
  previewCopy: { flex: 1, marginLeft: 13 },
  previewTitle: { color: "#F7F5FF", fontSize: 15, fontWeight: "800" },
  previewBody: { color: "#99A0B8", fontSize: 12, lineHeight: 17, marginTop: 4 },
  miniGrid: { flexDirection: "row", gap: 8, marginTop: 18 },
  miniSwatch: { flex: 1, height: 9, borderRadius: 5 },
  primaryButton: { minHeight: 59, borderRadius: 17, backgroundColor: "#9B7BFF", alignItems: "center", justifyContent: "center", flexDirection: "row", marginTop: 22, paddingHorizontal: 20 },
  primaryButtonPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  primaryButtonText: { color: "#10131F", fontSize: 16, fontWeight: "900" },
  primaryButtonArrow: { color: "#10131F", fontSize: 24, marginLeft: 12, marginTop: -2 },
  tipRow: { marginTop: 25, flexDirection: "row", alignItems: "center", backgroundColor: "#161A2A", borderRadius: 16, padding: 15 },
  tipIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: "#2B2649", alignItems: "center", justifyContent: "center" },
  tipIconText: { color: "#FFD166", fontSize: 18 },
  tipCopy: { flex: 1, marginLeft: 12 },
  tipTitle: { color: "#F7F5FF", fontSize: 12, fontWeight: "900" },
  tipBody: { color: "#99A0B8", fontSize: 12, lineHeight: 17, marginTop: 3 },
  gameMetaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  metaLabel: { color: "#99A0B8", fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  timerText: { color: "#F7F5FF", fontSize: 34, lineHeight: 38, fontWeight: "900", marginTop: 3 },
  timerUnit: { color: "#99A0B8", fontSize: 15 },
  comboBox: { alignItems: "flex-end" },
  comboLabel: { color: "#99A0B8", fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  comboValue: { color: "#48E0B2", fontSize: 28, lineHeight: 34, fontWeight: "900", marginTop: 3 },
  timerTrack: { height: 6, borderRadius: 4, overflow: "hidden", backgroundColor: "#1B2032", marginTop: 13 },
  timerFill: { height: "100%", borderRadius: 4 },
  targetCard: { marginTop: 28, minHeight: 258, borderRadius: 24, backgroundColor: "#1B2032", borderWidth: 1, borderColor: "#303751", alignItems: "center", justifyContent: "center", padding: 20 },
  targetCardHit: { borderColor: "#48E0B2" },
  targetCardMiss: { borderColor: "#FF6B8A" },
  targetKicker: { color: "#99A0B8", fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  targetLabel: { color: "#F7F5FF", fontSize: 20, fontWeight: "900", letterSpacing: 2, marginTop: 10 },
  targetOrb: { width: 112, height: 112, borderRadius: 56, marginTop: 18, alignItems: "center", justifyContent: "center" },
  targetOrbGlyph: { color: "#10131F", fontSize: 38, fontWeight: "900" },
  targetHint: { color: "#99A0B8", fontSize: 12, fontWeight: "700", marginTop: 16 },
  colorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 },
  colorButton: { width: "48.3%", minHeight: 65, borderRadius: 16, borderWidth: 1.5, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 9 },
  colorButtonPressed: { transform: [{ scale: 0.97 }], opacity: 0.8 },
  colorButtonDot: { width: 12, height: 12, borderRadius: 6 },
  colorButtonText: { fontSize: 14, fontWeight: "900" },
  bottomHint: { color: "#69718A", fontSize: 11, textAlign: "center", marginTop: 16 },
  finishCard: { backgroundColor: "#1B2032", borderRadius: 23, borderWidth: 1, borderColor: "#303751", padding: 21, alignItems: "center" },
  finishBadge: { borderRadius: 20, paddingHorizontal: 11, paddingVertical: 7, backgroundColor: "#2B2649" },
  finishBadgeText: { color: "#9B7BFF", fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  finishScore: { color: "#F7F5FF", fontSize: 72, lineHeight: 78, fontWeight: "900", letterSpacing: -3, marginTop: 15 },
  finishScoreLabel: { color: "#99A0B8", fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  finishDivider: { width: "100%", height: 1, backgroundColor: "#303751", marginVertical: 21 },
  finishStatsRow: { width: "100%", flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  finishStatValue: { color: "#48E0B2", textAlign: "center", fontSize: 24, fontWeight: "900" },
  finishStatLabel: { color: "#99A0B8", textAlign: "center", fontSize: 9, fontWeight: "900", letterSpacing: 0.5, marginTop: 5 },
  secondaryButton: { minHeight: 49, alignItems: "center", justifyContent: "center", marginTop: 10 },
  secondaryButtonPressed: { opacity: 0.65 },
  secondaryButtonText: { color: "#99A0B8", fontSize: 13, fontWeight: "800" },
});
