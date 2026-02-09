'use client';

import React from 'react';
import type { MuiComponentDef, MuiComponentCategory, MuiCategoryMeta } from '@/types';

// MUI Components
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Fab from '@mui/material/Fab';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import Rating from '@mui/material/Rating';
import ToggleButton from '@mui/material/ToggleButton';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Pagination from '@mui/material/Pagination';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Paper from '@mui/material/Paper';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';

// MUI Icons
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import SmartButtonIcon from '@mui/icons-material/SmartButton';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ArrowDropDownCircleIcon from '@mui/icons-material/ArrowDropDownCircle';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import TuneIcon from '@mui/icons-material/Tune';
import StarIcon from '@mui/icons-material/Star';
import SearchIcon from '@mui/icons-material/Search';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ViewListIcon from '@mui/icons-material/ViewList';
import TextFormatIcon from '@mui/icons-material/TextFormat';
import TableChartIcon from '@mui/icons-material/TableChart';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LabelIcon from '@mui/icons-material/Label';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import RemoveIcon from '@mui/icons-material/Remove';
import InfoIcon from '@mui/icons-material/Info';
import ImageIcon from '@mui/icons-material/Image';
import WebIcon from '@mui/icons-material/Web';
import BuildIcon from '@mui/icons-material/Build';
import TabIcon from '@mui/icons-material/Tab';
import SegmentIcon from '@mui/icons-material/Segment';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import BottomNavigationActionIcon from '@mui/icons-material/CallToAction';
import LinkIcon from '@mui/icons-material/Link';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SpeedIcon from '@mui/icons-material/Speed';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import WarningIcon from '@mui/icons-material/Warning';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import SnoozeIcon from '@mui/icons-material/Snooze';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import FlipToBackIcon from '@mui/icons-material/FlipToBack';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ArticleIcon from '@mui/icons-material/Article';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonIcon from '@mui/icons-material/Person';
import RestoreIcon from '@mui/icons-material/Restore';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// ─── Category Metadata ────────────────────────────────────────────────

export const MUI_CATEGORIES: MuiCategoryMeta[] = [
  { id: 'layout', label: 'Layout', labelKo: '레이아웃', icon: ViewQuiltIcon, color: '#6366f1', bgColor: '#eef2ff' },
  { id: 'inputs', label: 'Inputs', labelKo: '입력', icon: SmartButtonIcon, color: '#f97316', bgColor: '#fff7ed' },
  { id: 'dataDisplay', label: 'Data Display', labelKo: '데이터 표시', icon: TextFormatIcon, color: '#14b8a6', bgColor: '#f0fdfa' },
  { id: 'navigation', label: 'Navigation', labelKo: '네비게이션', icon: MenuIcon, color: '#ec4899', bgColor: '#fdf2f8' },
  { id: 'feedback', label: 'Feedback', labelKo: '피드백', icon: WarningIcon, color: '#ef4444', bgColor: '#fef2f2' },
  { id: 'surfaces', label: 'Surfaces', labelKo: '서피스', icon: ArticleIcon, color: '#64748b', bgColor: '#f8fafc' },
];

// ─── Component Registry ───────────────────────────────────────────────

export const MUI_REGISTRY: Record<string, MuiComponentDef> = {
  // ═══ Layout (all containers) ═══
  Container: {
    key: 'Container',
    label: 'Container',
    labelKo: '컨테이너',
    category: 'layout',
    icon: ViewQuiltIcon,
    isContainer: true,
    renderPreview: () => React.createElement(Container, {
      sx: { border: '2px dashed #6366f1', borderRadius: 1, p: 2, minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#eef2ff' },
    }, React.createElement(Typography, { variant: 'caption', color: 'text.secondary' }, 'Container')),
  },
  Box: {
    key: 'Box',
    label: 'Box',
    labelKo: '박스',
    category: 'layout',
    icon: CropSquareIcon,
    isContainer: true,
    renderPreview: () => React.createElement(Box, {
      sx: { border: '2px dashed #6366f1', borderRadius: 1, p: 2, minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#eef2ff' },
    }, React.createElement(Typography, { variant: 'caption', color: 'text.secondary' }, 'Box')),
  },
  Grid: {
    key: 'Grid',
    label: 'Grid',
    labelKo: '그리드',
    category: 'layout',
    icon: GridViewIcon,
    isContainer: true,
    renderPreview: () => React.createElement(Box, {
      sx: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5, p: 1, border: '2px dashed #6366f1', borderRadius: 1, minHeight: 60, bgcolor: '#eef2ff' },
    }, ...[1, 2, 3, 4].map(i => React.createElement(Box, { key: i, sx: { bgcolor: '#c7d2fe', borderRadius: 0.5, height: 20 } }))),
  },
  Stack: {
    key: 'Stack',
    label: 'Stack',
    labelKo: '스택',
    category: 'layout',
    icon: ViewStreamIcon,
    isContainer: true,
    renderPreview: () => React.createElement(Stack, {
      spacing: 0.5, sx: { border: '2px dashed #6366f1', borderRadius: 1, p: 1, minHeight: 60, bgcolor: '#eef2ff' },
    }, ...[1, 2, 3].map(i => React.createElement(Box, { key: i, sx: { bgcolor: '#c7d2fe', borderRadius: 0.5, height: 16 } }))),
  },

  // ═══ Inputs ═══
  Button: {
    key: 'Button',
    label: 'Button',
    labelKo: '버튼',
    category: 'inputs',
    icon: SmartButtonIcon,
    isContainer: false,
    defaultProps: { variant: 'contained', children: 'Button' },
    renderPreview: () => React.createElement(Button, { variant: 'contained', size: 'small' }, 'Button'),
  },
  IconButton: {
    key: 'IconButton',
    label: 'IconButton',
    labelKo: '아이콘 버튼',
    category: 'inputs',
    icon: TouchAppIcon,
    isContainer: false,
    renderPreview: () => React.createElement(IconButton, { size: 'small', color: 'primary' }, React.createElement(SearchIcon, { fontSize: 'small' })),
  },
  Fab: {
    key: 'Fab',
    label: 'FAB',
    labelKo: 'FAB',
    category: 'inputs',
    icon: AddCircleIcon,
    isContainer: false,
    renderPreview: () => React.createElement(Fab, { size: 'small', color: 'primary' }, React.createElement(AddCircleIcon, { fontSize: 'small' })),
  },
  TextField: {
    key: 'TextField',
    label: 'TextField',
    labelKo: '텍스트 필드',
    category: 'inputs',
    icon: TextFieldsIcon,
    isContainer: false,
    defaultProps: { label: 'Label', variant: 'outlined' },
    renderPreview: () => React.createElement(TextField, { label: 'Label', variant: 'outlined', size: 'small', sx: { width: 160 } }),
  },
  Select: {
    key: 'Select',
    label: 'Select',
    labelKo: '셀렉트',
    category: 'inputs',
    icon: ArrowDropDownCircleIcon,
    isContainer: false,
    defaultProps: { label: 'Select' },
    renderPreview: () => React.createElement(TextField, { label: 'Select', variant: 'outlined', size: 'small', select: true, sx: { width: 160 } }),
  },
  Checkbox: {
    key: 'Checkbox',
    label: 'Checkbox',
    labelKo: '체크박스',
    category: 'inputs',
    icon: CheckBoxIcon,
    isContainer: false,
    renderPreview: () => React.createElement(Checkbox, { defaultChecked: true, size: 'small' }),
  },
  Radio: {
    key: 'Radio',
    label: 'Radio',
    labelKo: '라디오',
    category: 'inputs',
    icon: RadioButtonCheckedIcon,
    isContainer: false,
    renderPreview: () => React.createElement(Radio, { checked: true, size: 'small' }),
  },
  Switch: {
    key: 'Switch',
    label: 'Switch',
    labelKo: '스위치',
    category: 'inputs',
    icon: ToggleOnIcon,
    isContainer: false,
    renderPreview: () => React.createElement(Switch, { defaultChecked: true, size: 'small' }),
  },
  Slider: {
    key: 'Slider',
    label: 'Slider',
    labelKo: '슬라이더',
    category: 'inputs',
    icon: TuneIcon,
    isContainer: false,
    renderPreview: () => React.createElement(Box, { sx: { width: 120, px: 1 } }, React.createElement(Slider, { defaultValue: 50, size: 'small' })),
  },
  Rating: {
    key: 'Rating',
    label: 'Rating',
    labelKo: '평점',
    category: 'inputs',
    icon: StarIcon,
    isContainer: false,
    renderPreview: () => React.createElement(Rating, { defaultValue: 3, size: 'small' }),
  },
  Autocomplete: {
    key: 'Autocomplete',
    label: 'Autocomplete',
    labelKo: '자동완성',
    category: 'inputs',
    icon: SearchIcon,
    isContainer: false,
    renderPreview: () => React.createElement(TextField, { label: 'Autocomplete', variant: 'outlined', size: 'small', sx: { width: 160 } }),
  },
  ToggleButton: {
    key: 'ToggleButton',
    label: 'ToggleButton',
    labelKo: '토글 버튼',
    category: 'inputs',
    icon: ToggleOffIcon,
    isContainer: false,
    renderPreview: () => React.createElement(ToggleButton, { value: 'check', selected: true, size: 'small' }, 'Toggle'),
  },
  ToggleButtonGroup: {
    key: 'ToggleButtonGroup',
    label: 'ToggleButtonGroup',
    labelKo: '토글 버튼 그룹',
    category: 'inputs',
    icon: ViewListIcon,
    isContainer: false,
    renderPreview: () => React.createElement(Box, { sx: { display: 'flex', gap: 0.5 } },
      React.createElement(ToggleButton, { value: 'a', selected: true, size: 'small' }, 'A'),
      React.createElement(ToggleButton, { value: 'b', size: 'small' }, 'B'),
    ),
  },

  // ═══ Data Display ═══
  Typography: {
    key: 'Typography',
    label: 'Typography',
    labelKo: '타이포그래피',
    category: 'dataDisplay',
    icon: TextFormatIcon,
    isContainer: false,
    defaultProps: { variant: 'h6', children: 'Text' },
    renderPreview: () => React.createElement(Typography, { variant: 'h6' }, 'Text'),
  },
  Table: {
    key: 'Table',
    label: 'Table',
    labelKo: '테이블',
    category: 'dataDisplay',
    icon: TableChartIcon,
    isContainer: true,
    renderPreview: () => React.createElement(Box, { sx: { border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' } },
      React.createElement(Box, { sx: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', bgcolor: '#f5f5f5' } },
        ...['Col 1', 'Col 2', 'Col 3'].map(h => React.createElement(Typography, { key: h, variant: 'caption', sx: { p: 0.5, fontWeight: 600, borderBottom: '1px solid #e0e0e0' } }, h)),
      ),
      React.createElement(Box, { sx: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' } },
        ...['A', 'B', 'C'].map(c => React.createElement(Typography, { key: c, variant: 'caption', sx: { p: 0.5 } }, c)),
      ),
    ),
  },
  List: {
    key: 'List',
    label: 'List',
    labelKo: '리스트',
    category: 'dataDisplay',
    icon: FormatListBulletedIcon,
    isContainer: true,
    renderPreview: () => React.createElement(Box, { sx: { border: '1px solid #e0e0e0', borderRadius: 1, p: 0.5 } },
      ...['Item 1', 'Item 2', 'Item 3'].map(item => React.createElement(Typography, { key: item, variant: 'caption', sx: { py: 0.25, px: 1 } }, `• ${item}`)),
    ),
  },
  ListItem: {
    key: 'ListItem',
    label: 'ListItem',
    labelKo: '리스트 아이템',
    category: 'dataDisplay',
    icon: ListAltIcon,
    isContainer: false,
    renderPreview: () => React.createElement(Box, { sx: { p: 1, border: '1px solid #e0e0e0', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 } },
      React.createElement(AccountCircleIcon, { fontSize: 'small', color: 'action' }),
      React.createElement(Typography, { variant: 'caption' }, 'List Item'),
    ),
  },
  Chip: {
    key: 'Chip',
    label: 'Chip',
    labelKo: '칩',
    category: 'dataDisplay',
    icon: LabelIcon,
    isContainer: false,
    defaultProps: { label: 'Chip' },
    renderPreview: () => React.createElement(Chip, { label: 'Chip', size: 'small', color: 'primary' }),
  },
  Avatar: {
    key: 'Avatar',
    label: 'Avatar',
    labelKo: '아바타',
    category: 'dataDisplay',
    icon: AccountCircleIcon,
    isContainer: false,
    renderPreview: () => React.createElement(Avatar, { sx: { width: 32, height: 32, bgcolor: '#14b8a6' } }, 'A'),
  },
  Badge: {
    key: 'Badge',
    label: 'Badge',
    labelKo: '뱃지',
    category: 'dataDisplay',
    icon: NotificationsIcon,
    isContainer: false,
    renderPreview: () => React.createElement(Badge, { badgeContent: 4, color: 'primary' }, React.createElement(NotificationsIcon, { fontSize: 'small' })),
  },
  Divider: {
    key: 'Divider',
    label: 'Divider',
    labelKo: '구분선',
    category: 'dataDisplay',
    icon: RemoveIcon,
    isContainer: false,
    renderPreview: () => React.createElement(Box, { sx: { width: 120 } }, React.createElement(Divider)),
  },
  Tooltip: {
    key: 'Tooltip',
    label: 'Tooltip',
    labelKo: '툴팁',
    category: 'dataDisplay',
    icon: InfoIcon,
    isContainer: false,
    renderPreview: () => React.createElement(Chip, { label: 'Hover me', size: 'small', variant: 'outlined' }),
  },
  ImageList: {
    key: 'ImageList',
    label: 'ImageList',
    labelKo: '이미지 목록',
    category: 'dataDisplay',
    icon: ImageIcon,
    isContainer: true,
    renderPreview: () => React.createElement(Box, { sx: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 } },
      ...[1, 2, 3, 4].map(i => React.createElement(Box, { key: i, sx: { bgcolor: '#e0e0e0', borderRadius: 0.5, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        React.createElement(ImageIcon, { sx: { fontSize: 12, color: '#9e9e9e' } }),
      )),
    ),
  },

  // ═══ Navigation ═══
  AppBar: {
    key: 'AppBar',
    label: 'AppBar',
    labelKo: '앱바',
    category: 'navigation',
    icon: WebIcon,
    isContainer: true,
    renderPreview: () => React.createElement(AppBar, { position: 'static', sx: { borderRadius: 1 } },
      React.createElement(Toolbar, { variant: 'dense', sx: { minHeight: 36 } },
        React.createElement(Typography, { variant: 'caption', sx: { flexGrow: 1 } }, 'AppBar'),
      ),
    ),
  },
  Toolbar: {
    key: 'Toolbar',
    label: 'Toolbar',
    labelKo: '툴바',
    category: 'navigation',
    icon: BuildIcon,
    isContainer: true,
    renderPreview: () => React.createElement(Paper, { variant: 'outlined', sx: { borderRadius: 1 } },
      React.createElement(Toolbar, { variant: 'dense', sx: { minHeight: 36, gap: 1 } },
        React.createElement(MenuIcon, { fontSize: 'small' }),
        React.createElement(Typography, { variant: 'caption' }, 'Toolbar'),
      ),
    ),
  },
  Tabs: {
    key: 'Tabs',
    label: 'Tabs',
    labelKo: '탭',
    category: 'navigation',
    icon: TabIcon,
    isContainer: false,
    renderPreview: () => React.createElement(Tabs, { value: 0, sx: { minHeight: 32 } },
      React.createElement(Tab, { label: 'Tab 1', sx: { minHeight: 32, py: 0, fontSize: 11 } }),
      React.createElement(Tab, { label: 'Tab 2', sx: { minHeight: 32, py: 0, fontSize: 11 } }),
    ),
  },
  Breadcrumbs: {
    key: 'Breadcrumbs',
    label: 'Breadcrumbs',
    labelKo: '브레드크럼',
    category: 'navigation',
    icon: SegmentIcon,
    isContainer: false,
    renderPreview: () => React.createElement(Breadcrumbs, { sx: { fontSize: 11 } },
      React.createElement(Link, { underline: 'hover', color: 'inherit', href: '#', sx: { fontSize: 11 } }, 'Home'),
      React.createElement(Link, { underline: 'hover', color: 'inherit', href: '#', sx: { fontSize: 11 } }, 'Page'),
      React.createElement(Typography, { color: 'text.primary', sx: { fontSize: 11 } }, 'Current'),
    ),
  },
  Drawer: {
    key: 'Drawer',
    label: 'Drawer',
    labelKo: '드로어',
    category: 'navigation',
    icon: MenuOpenIcon,
    isContainer: true,
    renderPreview: () => React.createElement(Paper, { variant: 'outlined', sx: { width: 120, p: 1, borderRadius: 1 } },
      React.createElement(Typography, { variant: 'caption', sx: { fontWeight: 600, mb: 0.5, display: 'block' } }, 'Drawer'),
      ...['Menu 1', 'Menu 2', 'Menu 3'].map(m => React.createElement(Typography, { key: m, variant: 'caption', sx: { display: 'block', py: 0.25 } }, m)),
    ),
  },
  Menu: {
    key: 'Menu',
    label: 'Menu',
    labelKo: '메뉴',
    category: 'navigation',
    icon: MenuIcon,
    isContainer: false,
    renderPreview: () => React.createElement(Paper, { variant: 'outlined', sx: { p: 0.5, borderRadius: 1 } },
      ...['Option 1', 'Option 2', 'Option 3'].map(m => React.createElement(Typography, { key: m, variant: 'caption', sx: { px: 1, py: 0.25, display: 'block', '&:hover': { bgcolor: '#f5f5f5' } } }, m)),
    ),
  },
  BottomNavigation: {
    key: 'BottomNavigation',
    label: 'BottomNavigation',
    labelKo: '하단 네비게이션',
    category: 'navigation',
    icon: BottomNavigationActionIcon,
    isContainer: false,
    renderPreview: () => React.createElement(BottomNavigation, { value: 0, showLabels: true, sx: { height: 48, borderRadius: 1 } },
      React.createElement(BottomNavigationAction, { label: 'Home', icon: React.createElement(HomeIcon, { sx: { fontSize: 14 } }), sx: { minWidth: 40, '& .MuiBottomNavigationAction-label': { fontSize: 9 } } }),
      React.createElement(BottomNavigationAction, { label: 'Favs', icon: React.createElement(FavoriteIcon, { sx: { fontSize: 14 } }), sx: { minWidth: 40, '& .MuiBottomNavigationAction-label': { fontSize: 9 } } }),
      React.createElement(BottomNavigationAction, { label: 'Me', icon: React.createElement(PersonIcon, { sx: { fontSize: 14 } }), sx: { minWidth: 40, '& .MuiBottomNavigationAction-label': { fontSize: 9 } } }),
    ),
  },
  Link: {
    key: 'Link',
    label: 'Link',
    labelKo: '링크',
    category: 'navigation',
    icon: LinkIcon,
    isContainer: false,
    renderPreview: () => React.createElement(Link, { href: '#', underline: 'hover', sx: { fontSize: 12 } }, 'Link Text'),
  },
  Pagination: {
    key: 'Pagination',
    label: 'Pagination',
    labelKo: '페이지네이션',
    category: 'navigation',
    icon: MoreHorizIcon,
    isContainer: false,
    renderPreview: () => React.createElement(Pagination, { count: 5, size: 'small', siblingCount: 0 }),
  },
  SpeedDial: {
    key: 'SpeedDial',
    label: 'SpeedDial',
    labelKo: '스피드 다이얼',
    category: 'navigation',
    icon: SpeedIcon,
    isContainer: false,
    renderPreview: () => React.createElement(Fab, { size: 'small', color: 'primary' }, React.createElement(AddCircleIcon, { fontSize: 'small' })),
  },
  Stepper: {
    key: 'Stepper',
    label: 'Stepper',
    labelKo: '스테퍼',
    category: 'navigation',
    icon: LinearScaleIcon,
    isContainer: false,
    renderPreview: () => React.createElement(Stepper, { activeStep: 1, sx: { '& .MuiStepLabel-label': { fontSize: 10 } } },
      React.createElement(Step, { key: 'step1' }, React.createElement(StepLabel, null, 'Step 1')),
      React.createElement(Step, { key: 'step2' }, React.createElement(StepLabel, null, 'Step 2')),
      React.createElement(Step, { key: 'step3' }, React.createElement(StepLabel, null, 'Step 3')),
    ),
  },

  // ═══ Feedback ═══
  Alert: {
    key: 'Alert',
    label: 'Alert',
    labelKo: '알림',
    category: 'feedback',
    icon: WarningIcon,
    isContainer: false,
    defaultProps: { severity: 'info', children: 'Alert message' },
    renderPreview: () => React.createElement(Alert, { severity: 'info', sx: { py: 0, '& .MuiAlert-message': { fontSize: 11 } } }, 'Alert message'),
  },
  Dialog: {
    key: 'Dialog',
    label: 'Dialog',
    labelKo: '다이얼로그',
    category: 'feedback',
    icon: ChatBubbleIcon,
    isContainer: true,
    renderPreview: () => React.createElement(Paper, { elevation: 3, sx: { p: 1, borderRadius: 1, minWidth: 120 } },
      React.createElement(Typography, { variant: 'caption', sx: { fontWeight: 600, display: 'block', mb: 0.5 } }, 'Dialog Title'),
      React.createElement(Typography, { variant: 'caption', sx: { display: 'block', color: 'text.secondary', mb: 0.5 } }, 'Content here'),
      React.createElement(Box, { sx: { display: 'flex', justifyContent: 'flex-end', gap: 0.5 } },
        React.createElement(Button, { size: 'small', sx: { fontSize: 10, minWidth: 0 } }, 'Cancel'),
        React.createElement(Button, { size: 'small', variant: 'contained', sx: { fontSize: 10, minWidth: 0 } }, 'OK'),
      ),
    ),
  },
  Snackbar: {
    key: 'Snackbar',
    label: 'Snackbar',
    labelKo: '스낵바',
    category: 'feedback',
    icon: SnoozeIcon,
    isContainer: false,
    renderPreview: () => React.createElement(Paper, { elevation: 3, sx: { px: 1.5, py: 0.5, borderRadius: 1, bgcolor: '#323232', display: 'inline-block' } },
      React.createElement(Typography, { variant: 'caption', sx: { color: '#fff' } }, 'Snackbar message'),
    ),
  },
  LinearProgress: {
    key: 'LinearProgress',
    label: 'LinearProgress',
    labelKo: '선형 진행바',
    category: 'feedback',
    icon: HourglassEmptyIcon,
    isContainer: false,
    renderPreview: () => React.createElement(Box, { sx: { width: 120 } }, React.createElement(LinearProgress, { variant: 'determinate', value: 60 })),
  },
  CircularProgress: {
    key: 'CircularProgress',
    label: 'CircularProgress',
    labelKo: '원형 진행바',
    category: 'feedback',
    icon: DonutLargeIcon,
    isContainer: false,
    renderPreview: () => React.createElement(CircularProgress, { size: 28, variant: 'determinate', value: 65 }),
  },
  Skeleton: {
    key: 'Skeleton',
    label: 'Skeleton',
    labelKo: '스켈레톤',
    category: 'feedback',
    icon: ViewAgendaIcon,
    isContainer: false,
    renderPreview: () => React.createElement(Box, { sx: { width: 120 } },
      React.createElement(Skeleton, { variant: 'text', width: 80, sx: { fontSize: 14 } }),
      React.createElement(Skeleton, { variant: 'rectangular', height: 20, sx: { borderRadius: 0.5 } }),
    ),
  },
  Backdrop: {
    key: 'Backdrop',
    label: 'Backdrop',
    labelKo: '백드롭',
    category: 'feedback',
    icon: FlipToBackIcon,
    isContainer: false,
    renderPreview: () => React.createElement(Box, { sx: { width: 80, height: 40, bgcolor: 'rgba(0,0,0,0.5)', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
      React.createElement(CircularProgress, { size: 16, sx: { color: '#fff' } }),
    ),
  },

  // ═══ Surfaces (all containers) ═══
  Card: {
    key: 'Card',
    label: 'Card',
    labelKo: '카드',
    category: 'surfaces',
    icon: CreditCardIcon,
    isContainer: true,
    renderPreview: () => React.createElement(Card, { variant: 'outlined', sx: { borderRadius: 1 } },
      React.createElement(CardContent, { sx: { p: 1, '&:last-child': { pb: 1 } } },
        React.createElement(Typography, { variant: 'caption', sx: { fontWeight: 600, display: 'block' } }, 'Card Title'),
        React.createElement(Typography, { variant: 'caption', color: 'text.secondary' }, 'Card content'),
      ),
    ),
  },
  Paper: {
    key: 'Paper',
    label: 'Paper',
    labelKo: '페이퍼',
    category: 'surfaces',
    icon: ArticleIcon,
    isContainer: true,
    renderPreview: () => React.createElement(Paper, { elevation: 2, sx: { p: 1.5, borderRadius: 1, minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
      React.createElement(Typography, { variant: 'caption', color: 'text.secondary' }, 'Paper'),
    ),
  },
  Accordion: {
    key: 'Accordion',
    label: 'Accordion',
    labelKo: '아코디언',
    category: 'surfaces',
    icon: ExpandMoreIcon,
    isContainer: true,
    renderPreview: () => React.createElement(Accordion, {
      defaultExpanded: false, disableGutters: true,
      sx: { borderRadius: '4px !important', '&:before': { display: 'none' } },
      children: React.createElement(AccordionSummary, { expandIcon: React.createElement(ExpandMoreIcon, { sx: { fontSize: 14 } }), sx: { minHeight: 32, '& .MuiAccordionSummary-content': { my: 0 } } },
        React.createElement(Typography, { variant: 'caption' }, 'Accordion'),
      ),
    }),
  },
};

// ─── Helper Functions ─────────────────────────────────────────────────

/** 카테고리별 MUI 컴포넌트 목록 반환 */
export function getMuiComponentsByCategory(category: MuiComponentCategory): MuiComponentDef[] {
  return Object.values(MUI_REGISTRY).filter(c => c.category === category);
}

/** 키로 MUI 컴포넌트 정의 반환 */
export function getMuiComponent(key: string): MuiComponentDef | undefined {
  return MUI_REGISTRY[key];
}

/** 전체 카테고리 메타데이터 반환 */
export function getAllMuiCategories(): MuiCategoryMeta[] {
  return MUI_CATEGORIES;
}

/** 카테고리 메타데이터 반환 */
export function getMuiCategoryMeta(category: MuiComponentCategory): MuiCategoryMeta | undefined {
  return MUI_CATEGORIES.find(c => c.id === category);
}
