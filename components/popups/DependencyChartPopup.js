import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    PanResponder,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';
import { getTaskDependencyChartByProjectId } from '../../utils/project';

const NODE_WIDTH = 140;      // was 180
const NODE_HEIGHT = 80;      // was 100
const H_SPACING = 80;        // was 120
const V_SPACING = 120;       // was 160


// Helper functions (date status & blocking logic)
const getDateStatus = (endDate) => {
    if (!endDate) return null;
    const now = new Date(), end = new Date(endDate);
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { type: 'overdue', days: Math.abs(diffDays), color: '#dc2626' };
    if (diffDays <= 1) return { type: 'urgent', days: diffDays, color: '#f97316' };
    if (diffDays <= 3) return { type: 'warning', days: diffDays, color: '#eab308' };
    return null;
};

const getBlockingStatus = (taskId, taskMap, dependencies) => {
    const current = taskMap[taskId];
    if (!current || current.progress >= 70) return { isBlocking: false };
    const blocked = dependencies
        .filter(d => d.to === taskId)
        .map(d => taskMap[d.from])
        .filter(t => t);
    const urgent = blocked.filter(t => {
        const s = getDateStatus(t.endDate);
        return s && (s.type === 'urgent' || s.type === 'overdue');
    });
    if (!urgent.length) return { isBlocking: false };
    const most = urgent.reduce((a, b) => {
        const sa = getDateStatus(a.endDate), sb = getDateStatus(b.endDate);
        if (sa.type === 'overdue') return a;
        if (sb.type === 'overdue') return b;
        return sa.days < sb.days ? a : b;
    });
    return {
        isBlocking: true,
        urgentTask: most,
        urgentStatus: getDateStatus(most.endDate),
        totalBlocked: urgent.length,
    };
};

// Layout algorithm (same as web)
const layoutTree = (tasks, dependencies) => {
    const taskMap = {};
    tasks.forEach(t => taskMap[t.id] = { ...t });
    const childrenMap = {};
    dependencies.forEach(d => {
        childrenMap[d.to] = childrenMap[d.to] || [];
        childrenMap[d.to].push(d.from);
    });

    const positionMap = {};
    const visited = new Set();
    const vertical = V_SPACING + NODE_HEIGHT;
    const horizontal = H_SPACING + NODE_WIDTH;

    const recurse = (id, x, y) => {
        if (visited.has(id)) return y;
        visited.add(id);
        const children = (childrenMap[id] || []);
        if (!children.length) {
            positionMap[id] = { x, y };
            return y + vertical;
        }
        let curY = y;
        const ys = [];
        children.forEach(child => {
            curY = recurse(child, x + horizontal, curY);
            ys.push(positionMap[child].y);
        });
        const avg = (Math.min(...ys) + Math.max(...ys)) / 2;
        positionMap[id] = { x, y: avg };
        return curY;
    };

    const roots = tasks.filter(t => !dependencies.some(d => d.from === t.id));
    let yOff = 0;
    roots.forEach(root => {
        yOff = recurse(root.id, 0, yOff);
    });
    // Construct node array with positions
    return tasks.map(t => ({
        ...t,
        x: positionMap[t.id].x,
        y: positionMap[t.id].y,
        parent: dependencies.find(d => d.from === t.id) ? positionMap[dependencies.find(d => d.from === t.id)?.to] : null
    }));
};
const { width, height } = Dimensions.get('window');
export default function DependencyChartNative({ visible, onClose, projectId }) {
    const [nodes, setNodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [scale, setScale] = useState(1);
    const [lastScale, setLastScale] = useState(1);
    const [pinchActive, setPinchActive] = useState(false);
    // Pinch-to-zoom gesture
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
            setPinchActive(false);
        },
        onPanResponderMove: (evt, gestureState) => {
            if (evt.nativeEvent.touches && evt.nativeEvent.touches.length === 2) {
                setPinchActive(true);
                const touch1 = evt.nativeEvent.touches[0];
                const touch2 = evt.nativeEvent.touches[1];
                const dx = touch2.pageX - touch1.pageX;
                const dy = touch2.pageY - touch1.pageY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (!panResponder._initialDistance) {
                    panResponder._initialDistance = distance;
                    panResponder._initialScale = scale;
                } else {
                    let newScale = panResponder._initialScale * (distance / panResponder._initialDistance);
                    newScale = Math.max(0.5, Math.min(2, newScale));
                    setScale(newScale);
                }
            }
        },
        onPanResponderRelease: () => {
            panResponder._initialDistance = null;
            panResponder._initialScale = null;
            setPinchActive(false);
        },
        onPanResponderTerminationRequest: () => true,
    });
    const theme = useTheme();

    useEffect(() => {
        if (visible) loadData();
    }, [visible]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getTaskDependencyChartByProjectId(projectId);
            const tasks = data.tasks || [];
            const deps = data.dependencies || [];

            const positioned = layoutTree(tasks, deps);
            const map = {};
            positioned.forEach(n => map[n.id] = n);

            const extended = positioned.map(n => {
                const dependIds = deps.filter(d => d.from === n.id).map(d => d.to);
                const canStart = dependIds.every(id => map[id]?.progress >= 70);
                const blockingStatus = getBlockingStatus(n.id, map, deps);
                return { ...n, canStart, blockingStatus };
            });
            setNodes(extended);
        } catch (e) {
            console.error(e);
            setNodes([]);
        } finally {
            setLoading(false);
        }
    };

    const totalWidth = Math.max(...nodes.map(n => n.x)) + NODE_WIDTH;
    const totalHeight = Math.max(...nodes.map(n => n.y)) + NODE_HEIGHT;
    const GRID_SIZE = 50;
    if (!visible) return null;

    return (
        <Modal visible transparent animationType="slide">
            <View style={[styles.overlay, { backgroundColor: theme.overlayBg }]}>
                <View style={[styles.popup, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>Task Dependency Flow</Text>
                        <TouchableOpacity onPress={onClose}>
                            <MaterialIcons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                    {/* Zoom percentage indicator */}
                    <View style={{ alignItems: 'flex-end', marginBottom: 6 }}>
                        <Text style={{ color: theme.text, fontSize: 12, fontWeight: '500', backgroundColor: theme.card, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 2, opacity: 0.85 }}>
                            Zoom: {Math.round(scale * 100)}%
                        </Text>
                    </View>
                    {loading ? (
                        <ActivityIndicator size="large" color={theme.primary} />
                    ) : !nodes.length ? (
                        <Text style={{ color: theme.text }}>No data found.</Text>
                    ) : (
                        <ScrollView horizontal {...panResponder.panHandlers}>
                            <Svg style={StyleSheet.absoluteFill}>
                                {/* Draw grid with lighter lines in dark mode */}
                                {Array.from({ length: Math.ceil((totalWidth + 50) / GRID_SIZE) }).map((_, i) => (
                                    <Line
                                        key={`vgrid-${i}`}
                                        x1={i * GRID_SIZE}
                                        y1={0}
                                        x2={i * GRID_SIZE}
                                        y2={totalHeight + 50}
                                        stroke={theme.mode === 'dark' ? '#cbd5e1' : '#999999'}
                                        strokeWidth={1}
                                    />
                                ))}
                                {Array.from({ length: Math.ceil((totalHeight + 50) / GRID_SIZE) }).map((_, i) => (
                                    <Line
                                        key={`hgrid-${i}`}
                                        x1={0}
                                        y1={i * GRID_SIZE}
                                        x2={totalWidth + 50}
                                        y2={i * GRID_SIZE}
                                        stroke={theme.mode === 'dark' ? '#cbd5e1' : '#999999'}
                                        strokeWidth={1}
                                    />
                                ))}
                            </Svg>
                            <ScrollView>
                                <View style={{ width: totalWidth + 50, height: totalHeight + 50, transform: [{ scale }] }}>
                                    <Svg style={StyleSheet.absoluteFill}>
                                        {nodes.map((n, i) => n.parent && (
                                            <Line
                                                key={`l-${i}`}
                                                x1={n.parent.x + NODE_WIDTH / 2}
                                                y1={n.parent.y + NODE_HEIGHT}
                                                x2={n.x + NODE_WIDTH / 2}
                                                y2={n.y}
                                                stroke="#6b7280" strokeWidth={2}
                                            />
                                        ))}
                                    </Svg>
                                    {nodes.map((n, i) => (
                                        <View key={n.id} style={[
                                            styles.node,
                                            {
                                                top: n.y,
                                                left: n.x,
                                                borderColor: n.blockingStatus.isBlocking ? '#dc2626' : (n.canStart ? '#10b981' : '#f59e0b'),
                                                backgroundColor: theme.mode === 'dark' ? '#1f2937' : '#fff'
                                            }
                                        ]}>
                                            <Text style={styles.taskName} numberOfLines={2}>{n.name}</Text>

                                            <Text style={styles.statusText}>Status: {n.status}</Text>
                                            <Text style={styles.statusText}>Prog: {n.progress}%</Text>
                                            {n.assignedUsers && n.assignedUsers.length > 0 && (
                                                <View style={styles.assignedUsersContainer}>
                                                    {n.assignedUsers.slice(0, 6).map(user => (
                                                        <View key={user.id} style={styles.userContainer}>
                                                            <Image source={{ uri: user.profilePhoto }} style={styles.userImage} />
                                                            <Text numberOfLines={1} style={styles.userName}>{user.name}</Text>
                                                        </View>
                                                    ))}
                                                    {n.assignedUsers.length > 6 && (
                                                        <Text style={{ fontSize: 10, color: '#6b7280' }}>
                                                            +{n.assignedUsers.length - 6} more
                                                        </Text>
                                                    )}
                                                </View>
                                            )}
                                            {n.blockingStatus.isBlocking ? (
                                                <Text style={[styles.blockText, { color: n.blockingStatus.urgentStatus.color }]}>
                                                    Blocks "{n.blockingStatus.urgentTask.name}" ({n.blockingStatus.urgentStatus.type})
                                                </Text>
                                            ) : (
                                                <Text style={[
                                                    styles.statusText,
                                                    { color: n.canStart ? '#10b981' : '#f59e0b' }
                                                ]}>
                                                    {n.canStart ? ' Ready to start' : ' Waiting…'}
                                                </Text>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        </ScrollView>
                    )}
                    {nodes.length > 0 && (
                        <View style={styles.zoomControls}>
                            <TouchableOpacity onPress={() => setScale(s => Math.max(0.5, s - 0.1))} style={styles.zoomButton}>
                                <Text style={styles.zoomText}>−</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setScale(s => Math.min(2, s + 0.1))} style={styles.zoomButton}>
                                <Text style={styles.zoomText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}
const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: 'rgba(0, 0, 0, 0.8)' },
    popup: {
        width: width * 0.92,
        height: height * 0.6,
        borderWidth: 1,
        borderRadius: 12,
        padding: 8,
        alignSelf: 'center',
        backgroundColor: '#fff',
    },

    header: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8, marginBottom: 18 },
    title: { fontSize: 16, fontWeight: '600' },
    node: {
        position: 'absolute',
        minHeight: NODE_HEIGHT,
        width: NODE_WIDTH,
        borderWidth: 2,
        borderRadius: 8,
        padding: 8,
        backgroundColor: '#fff',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        elevation: 2,
    },
    taskName: { fontWeight: '600', fontSize: 12, marginBottom: 4 },
    statusText: { fontSize: 10, color: '#6b7280' },
    blockText: { fontSize: 10, marginTop: 4 },
    zoomControls: { position: 'absolute', right: 16, bottom: 16, flexDirection: 'row' },
    zoomButton: { backgroundColor: '#e5e7eb', borderRadius: 20, width: 36, height: 36, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
    zoomText: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    assignedUsersContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 6,
        marginBottom: 4,
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 6,
        marginRight: 6,
        marginBottom: 6,
    },
    userImage: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 4,
    },
    userName: {
        fontSize: 9,
        color: '#374151',
        maxWidth: 80,
        overflow: 'hidden',
    },
});
