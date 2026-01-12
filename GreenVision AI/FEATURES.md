# 🌍 GreenVision AI - Feature Documentation

Dokumentasi lengkap semua fitur yang tersedia di platform GreenVision AI.

---

## 📑 Table of Contents

1. [Dashboard Beranda](#beranda)
2. [Monitor Iklim](#monitor-iklim)
3. [Energi & Karbon](#energi--karbon)
4. [Lingkungan](#lingkungan)
5. [AI Chat](#ai-chat)
6. [Dark/Light Mode](#darklight-mode)
7. [Navigation System](#navigation-system)
8. [Responsive Design](#responsive-design)

---

## 🏠 Beranda

**Lokasi**: Menu utama → "Beranda" atau langsung saat akses aplikasi

### Isi Fitur

#### Hero Section
- **Heading Utama**: "🌍 Aksi Iklim dengan AI"
- **Subtitle**: "Platform Cerdas untuk Mitigasi & Adaptasi Perubahan Iklim"
- **CTA Buttons**:
  - "🌤️ Mulai Monitor" → Navigasi ke Monitor Iklim
  - "🤖 Chat dengan AI" → Navigasi ke AI Chat
- **Visual Elements**:
  - Floating shapes dengan animasi (3 shapes)
  - Animations: float, pulse, rotate
  - Parallax effect on scroll

#### Features Grid
Menampilkan 4 fitur utama dalam grid responsive:

1. **Monitor Iklim**
   - Icon: Cloud & sun (⛅)
   - Description: "Prediksi cuaca ekstrim & risiko bencana real-time"
   - Action: Click → Go to Monitor section

2. **Energi Terbarukan**
   - Icon: Lightning bolt (⚡)
   - Description: "Jejak karbon & solusi energi berkelanjutan"
   - Action: Click → Go to Energi section

3. **Lingkungan Hidup**
   - Icon: Recycle symbol (♻️)
   - Description: "Manajemen sampah & kualitas udara"
   - Action: Click → Go to Lingkungan section

4. **AI Chat**
   - Icon: Robot (🤖)
   - Description: "Konsultasi dengan AI tentang aksi iklim"
   - Action: Click → Go to Chat section

### User Interactions
- Hover over feature cards → 3D rotation + glow effect
- Click feature cards → Smooth scroll to relevant section
- Scroll down → Stagger animations on cards

### Animations
- **fadeIn**: Cards fade in on page load
- **slideInUp**: Cards slide up from bottom
- **float**: Floating shapes oscillate
- **pulse**: Subtle opacity pulse
- **3D perspective**: Hover effects with rotateX/Y

---

## 🌍 Monitor Iklim

**Lokasi**: Menu → "Monitor Iklim" atau Beranda → "Mulai Monitor"

### Isi Fitur

#### Page Header
- **Title**: "🌤️ Monitor Iklim Real-Time"
- **Subtitle**: "Prediksi cuaca ekstrim & indikator risiko bencana"

#### Climate Cards (4 Cards)
Menampilkan data iklim untuk 4 region utama Indonesia:

##### 1. Weather Prediction
```
Region: Jabodetabek
├─ Temperature: 28°C
├─ Humidity: 75%
├─ Condition: Mendung
└─ Feel Like: 32°C
```
- Animated temperature bar
- Weather icon
- Forecast indicator

##### 2. Flood Risk
```
Location: Jabodetabek
├─ Risk Level: Tinggi (85%)
├─ Historical: 5 events/tahun
├─ Vulnerable Areas: 45 districts
└─ Status: 🔴 ALERT
```
- Risk meter with color coding (🟢 Low → 🔴 High)
- Historical data
- Alert system

##### 3. Fire Risk
```
Location: Kalimantan
├─ Risk Level: Tinggi (75%)
├─ Hotspots: 12 detected
├─ Burned Area: 50,000 ha/tahun
└─ Status: 🟠 WARNING
```
- Hotspot visualization
- Risk progression chart
- Historical trends

##### 4. Drought Risk
```
Location: Nusa Tenggara
├─ Risk Level: Sedang (60%)
├─ Water Level: -15%
├─ Affected Areas: 3 provinces
└─ Status: 🟡 CAUTION
```
- Water level indicator
- Rainfall prediction
- Affected regions list

### Alert System
- **High Risk**: Red background, blinking animation
- **Medium Risk**: Yellow background, pulsing animation
- **Low Risk**: Green background, stable display

### Data Visualization
- Progress bars dengan animated fill
- Color coding: 🟢 Green (safe), 🟡 Yellow (caution), 🔴 Red (danger)
- Real-time updates (simulated)

### User Interactions
- Hover cards → Zoom in + shadow intensify
- Click cards → Show detailed analytics (planned)
- Swipe on mobile → Scroll horizontally

---

## ⚡ Energi & Karbon

**Lokasi**: Menu → "Energi & Karbon"

### Isi Fitur

#### Page Header
- **Title**: "⚡ Energi & Jejak Karbon"
- **Subtitle**: "Kalkulator emisi & solusi energi terbarukan"

#### Section 1: Carbon Calculator

**Input Fields**:
```
┌─ Tipe Aktivitas: [Rumah tangga] ▼
│  Options: Rumah tangga, Transportasi, Industri
│
└─ Durasi (bulan): [1] [+][-]
```

**Output**:
```
┌─ Total Emisi CO₂: [X.XX] ton
├─ Interpretasi: "Setara dengan..."
└─ Rekomendasi: "Untuk mengurangi..."
```

**Formula**:
- Rumah tangga: 2.4 ton CO₂/bulan
- Transportasi: 0.4 ton CO₂/trip
- Industri: 15 ton CO₂/bulan

**Interaction**:
- Change activity type → Instant recalculation
- Adjust duration → Real-time update
- Animated number transitions
- Shows equivalent examples (e.g., "equals X km car drive")

#### Section 2: Renewable Energy Data

**Data Points**:
```
Sumber Energi Terbarukan
├─ Hydro: 6.5% (Target 2030: 7%)
│  ├─ Capacity: 8,500 MW
│  ├─ Status: Producing ✅
│  └─ Efficiency: 92%
├─ Geothermal: 3.4% (Target 2030: 4%)
├─ Solar: 0.1% (Target 2030: 1%)
└─ Wind: 0.9% (Target 2030: 2%)
```

**Visualizations**:
- Horizontal bars showing percentage
- Animated fill on page load
- Comparison with 2030 targets
- Efficiency badges

#### Section 3: Efficiency Tips

**4 Tips Cards**:
1. **Solar Panels**
   - "Hemat 50% listrik"
   - "Investasi: 15-25 juta"
   - "ROI: 5-7 tahun"

2. **LED Conversion**
   - "Hemat 80% vs pijar"
   - "Umur: 25,000 jam"
   - "Investment: rendah"

3. **Smart Thermostat**
   - "Hemat 15% AC power"
   - "Otomasi suhu"
   - "Control via app"

4. **Insulation**
   - "Hemat 30% heating"
   - "Umur: 50+ tahun"
   - "Investment: medium"

#### Section 4: Energy Chart

**Bar Chart Visualization**:
```
Emisi per Sektor (ton CO₂/tahun)
├─ Industri: ████████████ 250
├─ Transportasi: ██████████ 180
├─ Listrik: █████████ 150
├─ Pertanian: ███████ 120
└─ Residensial: ████ 80
```

**Interactions**:
- Hover bar → Show exact value
- Click bar → Show breakdown
- Animated bar fill on scroll
- Staggered animation (0.1s delay between bars)

---

## 🌱 Lingkungan

**Lokasi**: Menu → "Lingkungan"

### Isi Fitur

#### Page Header
- **Title**: "🌱 Lingkungan & Konservasi"
- **Subtitle**: "Monitoring kualitas lingkungan & aksi konservasi"

#### Section 1: Air Quality

**AQI Display**:
```
┌─────────────────────┐
│      68             │
│      SEDANG         │ ← Color changes: 🟢→🟡→🔴
└─────────────────────┘
```

**Pollutant Breakdown**:
```
PM2.5: ████████░░ 35 µg/m³ (🟠 Tinggi)
O₃:     ██████░░░░ 55 ppb (🟡 Sedang)
NO₂:    ███░░░░░░░ 28 ppb (🟢 Rendah)
```

**Data Points**:
- Current AQI value (0-500 scale)
- Status interpretation
- Health recommendations
- Historical trend (past 7 days)
- Worst affected cities

**Interactions**:
- Color-coded risk levels
- Animated bar fills
- Hover for details
- Pollutant explanations

#### Section 2: Waste Management

**Waste Categories** (Visual Breakdown):
```
Organik (60%) ♻️
├─ Kompos untuk tanaman
└─ Biogas untuk energi

Plastik (20%) 🏭
├─ Daur ulang packaging
└─ Paving blocks

Logam (15%) 🪨
├─ Recycling industry
└─ Remanufacturing

Berbahaya (5%) ⚠️
└─ Special handling facility
```

**Features**:
- Icon for each category
- Percentage breakdown
- Solution/treatment method
- Action buttons (Learn more)
- Animation: slide-in on scroll

#### Section 3: Biodiversity Stats

**Species Categories**:
```
Mamalia 🐘
├─ Total species: 6,400+
├─ Endangered: 1,200+
└─ Indonesia endemic: 1,000+

Burung 🦅
├─ Total species: 10,000+
├─ Endangered: 1,400+
└─ Indonesia endemic: 1,700+

Tumbuhan 🌿
├─ Total species: 400,000+
├─ Endangered: 80,000+
└─ Indonesia endemic: 40,000+

Akuatik 🐠
├─ Coral species: 5,000+
├─ Status: 30% bleached
└─ Ocean coverage: 2.3M km²
```

**Visualizations**:
- Icons for each category
- Large numbers with animation
- Status badges (Vulnerable, Endangered, Extinct)
- Trend arrows (↑ increasing, ↓ decreasing)

#### Section 4: Conservation Actions

**4 Action Cards**:
```
1️⃣ Reboisasi
   └─ Tanam pohon untuk hutan tropis
   └─ Target: 3M hektare by 2030

2️⃣ Lindungi Laut
   └─ Marine Protected Areas (MPA)
   └─ Expanded: 30M km² target

3️⃣ Edukasi
   └─ Awareness campaigns
   └─ School programs

4️⃣ Regulasi
   └─ Environmental policy
   └─ Enforcement & monitoring
```

**Features**:
- Large numbered icons
- Action description
- Call-to-action buttons
- Progress indicators
- Animated counter on scroll

---

## 💬 AI Chat

**Lokasi**: Menu → "AI Chat" atau Beranda → "Chat dengan AI"

### Isi Fitur

#### Page Header
- **Title**: "🤖 AI Konsultan Lingkungan"
- **Subtitle**: "Tanya jawab tentang iklim, lingkungan, dan solusi hijau"

#### Chat Interface

**Messages Area**:
```
┌─────────────────────────────────────┐
│ 🤖 AI: Halo! Saya siap membantu... │
│                                     │
│ 👤 You: Apa itu emisi karbon?       │
│                                     │
│ 🤖 AI: Emisi karbon adalah... [response] │
└─────────────────────────────────────┘
```

**Features**:
- User messages: Right-aligned, blue background
- AI messages: Left-aligned, gray/glass background
- Timestamps (optional)
- Auto-scroll to latest message
- Smooth message animations (slide-in + fade)
- Message bubbles with rounded corners

**Input Box**:
```
┌─────────────────────────────────────┐
│ [Tanya tentang iklim...] [➤ SEND]  │
└─────────────────────────────────────┘
```

**Features**:
- Placeholder text for guidance
- Send button with icon
- Enter key support (Shift+Enter for newline)
- Disabled state while loading
- Character counter (optional)
- Attachment button (planned)

#### Suggested Questions

**4 Quick Questions**:
1. "Bagaimana cara mengurangi emisi karbon pribadi?"
2. "Apa energi terbarukan terbaik untuk rumah?"
3. "Bagaimana dampak perubahan iklim di Indonesia?"
4. "Tips mengelola sampah plastik dengan baik"

**Interaction**:
- Click suggestion → Pre-fills input
- Auto-focus input
- Multiple selections possible
- Popular questions rotate daily (planned)

#### AI Response System

**Ollama Mode** (Recommended):
```
1. User sends message
2. Backend calls Ollama LLM
3. Model generates context-aware response
4. Response returned with metadata
5. Message displayed in chat

Latency: 2-10 seconds typical
Quality: High (7B model capable)
Cost: Free (local)
```

**Fallback Mode** (If Ollama unavailable):
```
1. User sends message
2. Backend detects Ollama unavailable
3. Uses rule-based response system
4. Matches message to category:
   ├─ Climate: iklim, cuaca, banjir, kebakaran, suhu
   ├─ Energy: energi, karbon, surya, listrik, kWh
   ├─ Environment: sampah, lingkungan, plastik, laut
   └─ Default: greeting, general questions
5. Selects random response from category
6. Returns with source: "fallback"
```

**Response Quality**:
- Contextual (matches user intent)
- Informative (facts & data)
- Actionable (includes solutions)
- Indonesian (natural language)
- Emoji-enhanced (visual appeal)

#### Chat History

**Storage**:
- Saved to browser localStorage
- Key: `chatHistory`
- Format: JSON array of messages
- Max 100 messages retained

**Features**:
- Auto-load on page refresh
- Clear history button (planned)
- Export chat (planned)
- Share conversations (planned)

**Privacy**:
- Data stored locally only
- Not sent to server
- Survives browser restart
- Clearable via dev tools

---

## 🌙 Dark/Light Mode

**Lokasi**: Navigation menu → Theme toggle button (🌙/☀️)

### Features

#### Toggle Button
- **Location**: Top-right nav settings
- **Icon**: 🌙 (dark mode) / ☀️ (light mode)
- **Hover**: Color change + glow effect
- **Click**: Instant theme switch

#### Light Mode (Default)
**Colors**:
```
Background: #f8fafc (almost white)
Text: #1e293b (dark)
Accent: #10b981 (green)
Secondary: #0891b2 (blue)
```

#### Dark Mode
**Colors**:
```
Background: #0f172a (deep blue-black)
Text: #f1f5f9 (light)
Accent: #10b981 (green) [same]
Secondary: #0891b2 (blue) [same]
```

#### Transition
- **Duration**: 300ms smooth transition
- **Property**: All CSS variables
- **No flash**: Opacity transitions prevent flashing
- **Immediate**: No page reload needed

#### Persistence
- **Storage**: localStorage key: `theme`
- **Values**: "light" or "dark"
- **Auto-restore**: Theme restored on page reload
- **OS sync**: Can sync with system preference (prefers-color-scheme)

#### Component Changes

**Navigation**:
```
Light: White background, dark text
Dark: Dark background, light text
```

**Cards**:
```
Light: White cards, subtle shadows
Dark: Dark cards with lighter borders, glow effects
```

**Buttons**:
```
Light: Solid colors with hover effects
Dark: Glassmorphism with backdrop blur
```

**Text**:
```
Light: Dark text for high contrast
Dark: Light text with higher line-height for readability
```

---

## 🧭 Navigation System

**Unique Feature**: Logo-centered navigation at top

### Logo Button

**Design**:
- **Position**: Fixed, center-top (30px from top)
- **Size**: 60px circular button
- **Icon**: Custom SVG (earth + leaf + energy ring)
- **Colors**: Green (#10b981) + Blue (#0891b2)
- **Animation**: Hover zoom + glow

**Interactions**:
- Click → Open navigation overlay
- Hover → Scale + shadow intensify
- Click again → Close overlay

### Navigation Overlay

**Style**:
- **Position**: Full-screen overlay
- **Background**: Blur effect (backdrop-filter: blur(30px))
- **Color**: Semi-transparent white/dark
- **Animation**: Zoom-in on open, zoom-out on close

**Menu Items** (6 main sections):
```
1. 🏠 Beranda (Home)
2. 🌍 Monitor Iklim (Climate Monitoring)
3. ⚡ Energi & Karbon (Energy & Carbon)
4. 🌱 Lingkungan (Environment)
5. 💬 AI Chat (AI Consultant)
6. ℹ️ Tentang Dampak (About Social Impact)
```

**Features**:
- Icons + labels
- Click to navigate
- Smooth scroll to section
- Auto-close on selection
- Keyboard support (Escape to close)

### Settings Section

**Theme Toggle**:
- 🌙 Moon icon = Dark mode
- ☀️ Sun icon = Light mode
- Instant switch
- Visual feedback

**Accessibility** (Planned):
- High contrast mode
- Font size adjustment
- Focus indicators
- Screen reader support

### Close Mechanisms

1. **Close Button**: X button in top-right
2. **Backdrop Click**: Click outside menu
3. **Menu Selection**: Auto-close after navigation
4. **Escape Key**: Keyboard close

### Responsive Behavior

**Desktop** (1024px+):
- Logo button centered, always visible
- Full overlay on click
- Menu items in single column

**Tablet** (768px-1024px):
- Logo button same position
- Overlay adjusted for screen size
- Touch-friendly tap targets

**Mobile** (320px-768px):
- Logo button easy thumb access
- Full-screen overlay
- Larger touch targets (40px+)
- Landscape support

---

## 📱 Responsive Design

### Breakpoints

```css
Mobile:     320px - 768px
Tablet:     768px - 1024px
Desktop:    1024px+
```

### Responsive Behavior

#### Mobile (320px - 768px)

**Layout**:
- Single column stacking
- Full-width sections
- Centered content
- Margin: 16px (padding sides)

**Hero**:
- Vertical layout (no 2-column)
- Larger heading
- CTA buttons full-width
- Floating shapes hidden

**Cards**:
- Full width
- Single column
- Larger touch targets (40px+ height)
- No hover effects (touch instead)

**Chat**:
- Full-width input
- Message bubbles 80% width
- Touch-friendly keyboard

#### Tablet (768px - 1024px)

**Layout**:
- 2-column grids where applicable
- Sections have padding: 24px
- Wider margins

**Cards**:
- 2 columns
- Balanced spacing
- Hover effects supported

**Features Grid**:
- 2x2 grid for feature cards
- Larger card size
- Icons bigger

#### Desktop (1024px+)

**Layout**:
- Multi-column layouts
- Max-width containers (1200px)
- Generous spacing

**Cards**:
- 4 columns where applicable
- 3-column for other grids
- Large hover effects

**Features Grid**:
- 4 columns
- Large icons
- Detailed descriptions
- 3D perspective on hover

### Font Sizes

```css
Mobile:   16px base, 24px h1, 18px h2
Tablet:   16px base, 28px h1, 20px h2
Desktop:  16px base, 32px h1, 24px h2
```

### Touch Optimization

**Mobile Button Size**:
- Min height: 44px (Apple's standard)
- Min width: 44px
- Padding: 12px 20px
- Spacing: 8px between buttons

**Tap Targets**:
- Links: 44x44 minimum
- Close buttons: 48x48
- Menu items: 50px height

### Performance

**Mobile Loading**:
- Images lazy-loaded
- CSS critical path optimized
- JavaScript deferred
- Fallback fonts ready

**Mobile Animations**:
- Reduced on mobile (prefers-reduced-motion)
- 30fps minimum
- GPU accelerated (transform, opacity)
- No jank on scroll

---

## ⌨️ Keyboard Navigation

### Supported Keys

```
Tab             → Focus next element
Shift + Tab     → Focus previous element
Enter           → Activate button/send message
Escape          → Close overlay/cancel
Space           → Toggle button/checkbox
Arrow Keys      → Navigate (planned)
```

### Tab Order
1. Logo button
2. Chat input
3. Send button
4. Suggested questions
5. Theme toggle
6. Close button

### Focus Indicators
- Blue outline on focused elements
- Minimum 2px width
- High contrast ratio
- No loss of visibility

---

## 🎨 Visual Design System

### Colors

**Primary Green** (Sustainability):
```
#10b981 (main)
#34d399 (light)
#059669 (dark)
```

**Primary Blue** (Water/Sky):
```
#0891b2 (main)
#06b6d4 (light)
#0e7490 (dark)
```

**Neutral**:
```
#ffffff (white)
#f8fafc (off-white)
#1e293b (dark)
#0f172a (very dark)
```

### Shadows

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
--shadow-md: 0 4px 6px rgba(0,0,0,0.1)
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1)
--shadow-xl: 0 20px 25px rgba(0,0,0,0.1)
--shadow-glow: 0 0 20px rgba(16,185,129,0.3)
```

### Border Radius

```css
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 16px
--radius-xl: 32px
```

### Typography

**Font**: Poppins (Google Fonts)
- Weights: 300, 400, 500, 600, 700, 800
- Line-height: 1.6 (body), 1.2 (headings)
- Letter-spacing: 0.5px (headings)

---

## 🔊 Accessibility

### WCAG 2.1 AA Compliance

**Color Contrast**:
- Text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

**Keyboard Navigation**:
- All features accessible via keyboard
- Tab order logical and intuitive
- Focus indicators visible

**Semantic HTML**:
- Proper heading hierarchy (h1 → h6)
- ARIA labels where needed
- Form labels associated with inputs
- Alt text for images

**Screen Readers**:
- Screen reader friendly
- ARIA roles defined
- Landmarks used (nav, main, section)
- Live regions for dynamic content

---

## 📊 Performance

### Load Time Targets
- First Contentful Paint: < 1s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Time to Interactive: < 3.5s

### File Sizes
- HTML: ~1500 lines (25KB)
- CSS: ~1800 lines (45KB)
- JS: ~1200 lines (35KB)
- Total: ~105KB (uncompressed)

### Optimization
- CSS minification ready
- JavaScript minification ready
- Image optimization
- Caching headers configured

---

## 🚀 Future Features

- [ ] User authentication
- [ ] Data export (CSV, PDF)
- [ ] Mobile app (React Native)
- [ ] Real-time APIs integration
- [ ] More Ollama models
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Social features (sharing, leaderboards)
- [ ] Gamification elements
- [ ] Integration with IoT sensors

---

Last updated: January 2024
Version: 1.0.0
Status: Production Ready
