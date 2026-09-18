"""
Generate Professional 16:9 PowerPoint (.pptx) Presentation for SafeCircle
Team: Hellfire Club
Presenters: Sathandhurkes & Harshika
Theme: Progressive Emergency Protection with User-Governed Differential Privacy
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Color definitions
    BG_DARK = RGBColor(18, 18, 22)        # Deep Charcoal
    CARD_BG = RGBColor(28, 28, 35)        # Card surface
    CARD_BORDER = RGBColor(55, 55, 65)    # Subtle border
    ROSE_PRIMARY = RGBColor(225, 29, 72)  # #e11d48 Brand Accent
    ROSE_DEEP = RGBColor(190, 18, 60)     # #be123c
    WHITE = RGBColor(255, 255, 255)
    LIGHT_GRAY = RGBColor(220, 220, 228)
    MUTED_GRAY = RGBColor(156, 163, 175)
    AMBER = RGBColor(245, 158, 11)        # Caution
    EMERALD = RGBColor(16, 185, 129)      # Normal

    blank_layout = prs.slide_layouts[6]

    def add_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, category_text="SAFECIRCLE"):
        # Category tag
        tag_box = slide.shapes.add_textbox(Inches(0.9), Inches(0.45), Inches(11.5), Inches(0.35))
        tf_tag = tag_box.text_frame
        tf_tag.word_wrap = True
        tf_tag.margin_left = tf_tag.margin_right = tf_tag.margin_top = tf_tag.margin_bottom = 0
        p_tag = tf_tag.paragraphs[0]
        p_tag.text = category_text.upper() + "  |  TEAM HELLFIRE CLUB"
        p_tag.font.size = Pt(11)
        p_tag.font.bold = True
        p_tag.font.color.rgb = ROSE_PRIMARY

        # Slide Title
        title_box = slide.shapes.add_textbox(Inches(0.9), Inches(0.8), Inches(11.5), Inches(0.8))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        tf_title.margin_left = tf_title.margin_right = tf_title.margin_top = tf_title.margin_bottom = 0
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(26)
        p_title.font.bold = True
        p_title.font.color.rgb = WHITE

    def add_card(slide, left, top, width, height, bg_color=CARD_BG, border_color=None):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(1.5)
        else:
            card.line.fill.background()
        return card

    def add_speaker_note(slide, note_text):
        notes_slide = slide.notes_slide
        tf = notes_slide.notes_text_frame
        tf.text = note_text

    # =========================================================================
    # SLIDE 1: TITLE SLIDE
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    add_background(slide1)

    # Accent top border strip
    accent_strip = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.12))
    accent_strip.fill.solid()
    accent_strip.fill.fore_color.rgb = ROSE_PRIMARY
    accent_strip.line.fill.background()

    # Team & Category Badge
    badge = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(1.4), Inches(4.2), Inches(0.5))
    badge.fill.solid()
    badge.fill.fore_color.rgb = CARD_BG
    badge.line.color.rgb = ROSE_PRIMARY
    badge.line.width = Pt(1.5)
    tf_b = badge.text_frame
    tf_b.margin_left = tf_b.margin_right = tf_b.margin_top = tf_b.margin_bottom = 0
    p_b = tf_b.paragraphs[0]
    p_b.text = "  TEAM HELLFIRE CLUB  •  HACKATHON 2026"
    p_b.font.size = Pt(12)
    p_b.font.bold = True
    p_b.font.color.rgb = ROSE_PRIMARY
    p_b.alignment = PP_ALIGN.CENTER

    # Main App Title
    t_box = slide1.shapes.add_textbox(Inches(1.0), Inches(2.1), Inches(11.3), Inches(1.4))
    tf = t_box.text_frame
    p = tf.paragraphs[0]
    p.text = "SafeCircle"
    p.font.size = Pt(54)
    p.font.bold = True
    p.font.color.rgb = WHITE

    # Subtitle
    sub_box = slide1.shapes.add_textbox(Inches(1.0), Inches(3.3), Inches(11.3), Inches(1.0))
    tf_sub = sub_box.text_frame
    p_sub = tf_sub.paragraphs[0]
    p_sub.text = "Intelligent Privacy-First Personal Safety & Progressive Disclosure"
    p_sub.font.size = Pt(22)
    p_sub.font.color.rgb = LIGHT_GRAY

    p_tagline = tf_sub.add_paragraph()
    p_tagline.text = "\"Presence in a safety circle does not grant blanket access to your private life.\""
    p_tagline.font.size = Pt(16)
    p_tagline.font.italic = True
    p_tagline.font.color.rgb = ROSE_PRIMARY

    # Presenters Card
    pres_card = add_card(slide1, Inches(1.0), Inches(4.8), Inches(11.3), Inches(1.6), CARD_BG, CARD_BORDER)
    p_box = slide1.shapes.add_textbox(Inches(1.3), Inches(5.0), Inches(10.7), Inches(1.2))
    tf_p = p_box.text_frame
    
    p1 = tf_p.paragraphs[0]
    p1.text = "PRESENTED BY"
    p1.font.size = Pt(11)
    p1.font.bold = True
    p1.font.color.rgb = MUTED_GRAY

    p2 = tf_p.add_paragraph()
    p2.text = "Sathandhurkes & Harshika"
    p2.font.size = Pt(24)
    p2.font.bold = True
    p2.font.color.rgb = WHITE

    p3 = tf_p.add_paragraph()
    p3.text = "Team Hellfire Club  |  Production-Grade Hybrid Android + Real-Time Multi-Device Platform"
    p3.font.size = Pt(13)
    p3.font.color.rgb = LIGHT_GRAY

    add_speaker_note(slide1, 
        "SATHANDHURKES: Good day esteemed judges and fellow participants. We are Team Hellfire Club, and today Harshika and I are proud to present SafeCircle.\n\n"
        "HARSHIKA: SafeCircle is an intelligent personal safety platform built from the ground up on one core thesis: 'Presence in a safety circle does not grant blanket access to your private life.' Today we will show you not just slides, but a live, three-device demonstration connecting a commuter, Mom, and Dad in real time."
    )

    # =========================================================================
    # SLIDE 2: THE PROBLEM: THE SURVEILLANCE TRAP
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    add_background(slide2)
    add_header(slide2, "The Dilemma: Safety vs. Surveillance", "THE PROBLEM")

    col_w = Inches(3.6)
    gap = Inches(0.3)
    top_pos = Inches(1.8)
    card_h = Inches(4.8)

    # Card 1: The Stat
    add_card(slide2, Inches(0.9), top_pos, col_w, card_h, CARD_BG, CARD_BORDER)
    tb = slide2.shapes.add_textbox(Inches(1.1), top_pos + Inches(0.3), col_w - Inches(0.4), card_h - Inches(0.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "78%"
    p.font.size = Pt(44)
    p.font.bold = True
    p.font.color.rgb = ROSE_PRIMARY
    p2 = tf.add_paragraph()
    p2.text = "of women report anxiety when commuting alone at night.\n\nYet, existing safety apps fail because they force an all-or-nothing choice."
    p2.font.size = Pt(14)
    p2.font.color.rgb = LIGHT_GRAY

    # Card 2: The Surveillance Trap
    add_card(slide2, Inches(0.9) + col_w + gap, top_pos, col_w, card_h, CARD_BG, CARD_BORDER)
    tb2 = slide2.shapes.add_textbox(Inches(1.1) + col_w + gap, top_pos + Inches(0.3), col_w - Inches(0.4), card_h - Inches(0.6))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "The Surveillance Trap"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = WHITE
    points = [
        ("24/7 Continuous GPS", "Apps like Life360 & Find My broadcast exact latitude & longitude perpetually."),
        ("Infantilizing & Intrusive", "Routine grocery stops, friend visits, and coffee breaks trigger awkward calls."),
        ("Severe Battery Drain", "Continuous background GPS tracking drains phone batteries in just a few hours.")
    ]
    for title, desc in points:
        p_pt = tf2.add_paragraph()
        p_pt.text = f"• {title}: {desc}"
        p_pt.font.size = Pt(13)
        p_pt.font.color.rgb = LIGHT_GRAY
        p_pt.space_before = Pt(10)

    # Card 3: The Fatal Consequence
    add_card(slide2, Inches(0.9) + (col_w + gap)*2, top_pos, col_w, card_h, CARD_BG, ROSE_DEEP)
    tb3 = slide2.shapes.add_textbox(Inches(1.1) + (col_w + gap)*2, top_pos + Inches(0.3), col_w - Inches(0.4), card_h - Inches(0.6))
    tf3 = tb3.text_frame
    tf3.word_wrap = True
    p = tf3.paragraphs[0]
    p.text = "The Fatal Consequence"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = ROSE_PRIMARY
    consequences = [
        "Users turn tracking OFF to preserve personal autonomy and battery.",
        "Zero Protection: When a genuine crisis occurs, guardians have zero telemetry and no idea where they are.",
        "Unreliable SOS: Panic buttons fail because guardians were turned off or ignored as noise."
    ]
    for c in consequences:
        p_c = tf3.add_paragraph()
        p_c.text = f"⚠️ {c}"
        p_c.font.size = Pt(13)
        p_c.font.color.rgb = LIGHT_GRAY
        p_c.space_before = Pt(12)

    add_speaker_note(slide2,
        "HARSHIKA: Every single day, women face a toxic trade-off: surrender your privacy 24/7 to family members, or turn off tracking and travel completely unprotected. Life360 and Find My treat young women like cargo to be tracked continuously.\n\n"
        "SATHANDHURKES: Because of this constant surveillance and battery drain, women simply turn off location permissions. And that is when tragedies happen: when the tracking is off, you have zero emergency response capability."
    )

    # =========================================================================
    # SLIDE 3: THE PARADIGM SHIFT
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    add_background(slide3)
    add_header(slide3, "The SafeCircle Paradigm Shift", "THE SOLUTION")

    rows = 6
    cols = 2
    left = Inches(0.9)
    top = Inches(1.8)
    width = Inches(11.5)
    height = Inches(4.8)

    table_shape = slide3.shapes.add_table(rows, cols, left, top, width, height)
    table = table_shape.table
    table.columns[0].width = Inches(5.6)
    table.columns[1].width = Inches(5.9)

    headers = ["Traditional Safety Apps (Life360 / Find My)", "SafeCircle Progressive Protection"]
    for c_idx, h in enumerate(headers):
        cell = table.cell(0, c_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = CARD_BG if c_idx == 0 else ROSE_DEEP
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.bold = True
        p.font.size = Pt(14)
        p.font.color.rgb = WHITE

    comparisons = [
        ("All-or-Nothing GPS: 24/7 continuous location broadcasting.", 
         "Progressive Disclosure: Zero coordinates revealed in Normal; unlocks dynamically only upon verified risk."),
        ("Guardian-Dictated: Parents inspect all daily routines without consent.", 
         "User-Governed Privacy: Commuter sets tiered permissions (Mom = Priority 1, Dad = Priority 2)."),
        ("Frequent False Alarms: One GPS bounce sends panic notifications.", 
         "Deterministic Risk Scoring: Compounding 0–100 risk algorithm requires confirmation before alerting."),
        ("Toy Mockups / Single Device: Fake hardcoded local JSON users.", 
         "Full 3-Device Real-Time Stack: Real Person, Mom, and Dad syncing live via WebSockets."),
        ("Basic Web Wrappers: Vulnerable to phone seizure.", 
         "Native Android Discreet Mode: Dynamic activity-alias icon switcher + PIN-protected Calculator camouflage.")
    ]

    for r_idx, (bad, good) in enumerate(comparisons, start=1):
        c0 = table.cell(r_idx, 0)
        c0.fill.solid()
        c0.fill.fore_color.rgb = CARD_BG
        p0 = c0.text_frame.paragraphs[0]
        p0.text = bad
        p0.font.size = Pt(12)
        p0.font.color.rgb = LIGHT_GRAY

        c1 = table.cell(r_idx, 1)
        c1.fill.solid()
        c1.fill.fore_color.rgb = CARD_BG
        p1 = c1.text_frame.paragraphs[0]
        p1.text = good
        p1.font.size = Pt(12)
        p1.font.bold = True
        p1.font.color.rgb = WHITE

    add_speaker_note(slide3,
        "SATHANDHURKES: Here is our architectural paradigm shift. In SafeCircle, safety is not a binary switch. It is progressive and mathematical.\n\n"
        "HARSHIKA: Under normal conditions, Mom and Dad simply see 'In Transit — Safe'. The backend physically filters coordinates from the payload. But if a real risk emerges, SafeCircle progressively unfolds the necessary safety telemetry without ever compromising autonomy."
    )

    # =========================================================================
    # SLIDE 4: THE 4 PROGRESSIVE SAFETY STATES
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    add_background(slide4)
    add_header(slide4, "Compounding Risk Engine & Differential Privacy", "DYNAMIC DISCLOSURE MATRIX")

    col_w4 = Inches(2.7)
    gap4 = Inches(0.2)
    top4 = Inches(1.8)
    h4 = Inches(4.8)

    states = [
        ("NORMAL COMMUTE", "Risk Score: 0 – 29", EMERALD, [
            "Status: 'In Transit — Safe'",
            "Exact GPS: STRICTLY HIDDEN",
            "Guardians: Routine transit status",
            "Differential: No map rendered",
            "Battery: 15-minute heartbeats"
        ]),
        ("CAUTION DETOUR", "Risk Score: 30 – 49", AMBER, [
            "Trigger: Safe corridor detour / delay",
            "Status: Amber Caution indicator",
            "Exact GPS: STILL HIDDEN",
            "In-App Check-In: 'Are you safe?'",
            "Guardians: Advised standby"
        ]),
        ("ELEVATED RISK", "Risk Score: 50 – 74", RGBColor(234, 88, 12), [
            "Trigger: Missed check-in / route lost",
            "Mom (Priority 1): Approximate sector unlocked (1km radius)",
            "Dad (Priority 2): Kept on standby",
            "Phone: Vibrates discreet check-in",
            "Battery level: Shared to Mom"
        ]),
        ("CRISIS EMERGENCY", "Risk Score: 75 – 100", ROSE_PRIMARY, [
            "Trigger: SOS button or silent 911=",
            "Full Override: Mom, Dad & Police",
            "Exact GPS: Live sub-meter pin",
            "Emergency Profile: Blood group, allergies, contact numbers",
            "Audio beacon dispatched"
        ])
    ]

    for idx, (s_title, s_score, s_color, s_bullets) in enumerate(states):
        x = Inches(0.9) + idx * (col_w4 + gap4)
        add_card(slide4, x, top4, col_w4, h4, CARD_BG, s_color)

        tb = slide4.shapes.add_textbox(x + Inches(0.15), top4 + Inches(0.2), col_w4 - Inches(0.3), h4 - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True

        p_t = tf.paragraphs[0]
        p_t.text = s_title
        p_t.font.size = Pt(15)
        p_t.font.bold = True
        p_t.font.color.rgb = s_color

        p_sc = tf.add_paragraph()
        p_sc.text = s_score
        p_sc.font.size = Pt(11)
        p_sc.font.bold = True
        p_sc.font.color.rgb = WHITE
        p_sc.space_after = Pt(8)

        for b in s_bullets:
            p_b = tf.add_paragraph()
            p_b.text = f"• {b}"
            p_b.font.size = Pt(11)
            p_b.font.color.rgb = LIGHT_GRAY
            p_b.space_before = Pt(6)

    add_speaker_note(slide4,
        "SATHANDHURKES: Notice the progression here. SafeCircle calculates a mathematical risk score from 0 to 100 based on route adherence, missed check-ins, and battery level.\n\n"
        "HARSHIKA: Crucially, our backend enforces differential privacy. Mom is designated Priority 1 guardian, so in ELEVATED, she gets an approximate sector. Dad is Priority 2, so he remains on standby until full CRISIS. This prevents family panic while ensuring rapid escalation."
    )

    # =========================================================================
    # SLIDE 5: 3-DEVICE REAL-TIME ARCHITECTURE
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    add_background(slide5)
    add_header(slide5, "Live Multi-Device WebSocket Gateway", "SYSTEM ARCHITECTURE")

    dev_w = Inches(3.6)
    dev_gap = Inches(0.3)
    dev_top = Inches(1.8)
    dev_h = Inches(3.4)

    devices = [
        ("DEVICE 1: COMMUTER (PERSON)", "user@safecircle.app", ROSE_PRIMARY, [
            "Physical Android Device or PWA",
            "Governs Circle permissions & privacy rules",
            "Starts SafePath journeys",
            "Discreet Mode with PIN unlock & silent SOS"
        ]),
        ("DEVICE 2: PRIMARY GUARDIAN (MOM)", "mom@safecircle.app", WHITE, [
            "Physical Android Device / Laptop Client",
            "Designated Priority 1 Guardian",
            "Receives Level 1–3 escalation alerts",
            "Unlocks approximate sector in ELEVATED risk"
        ]),
        ("DEVICE 3: SECONDARY GUARDIAN (DAD)", "dad@safecircle.app", WHITE, [
            "Physical Android Device / Laptop Client",
            "Designated Priority 2 Guardian",
            "Standby in Caution & Elevated states",
            "Unlocks full live GPS pin in Crisis SOS"
        ])
    ]

    for idx, (d_title, d_email, d_color, d_bullets) in enumerate(devices):
        x = Inches(0.9) + idx * (dev_w + dev_gap)
        add_card(slide5, x, dev_top, dev_w, dev_h, CARD_BG, CARD_BORDER)

        tb = slide5.shapes.add_textbox(x + Inches(0.15), dev_top + Inches(0.2), dev_w - Inches(0.3), dev_h - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True

        p_t = tf.paragraphs[0]
        p_t.text = d_title
        p_t.font.size = Pt(14)
        p_t.font.bold = True
        p_t.font.color.rgb = d_color

        p_e = tf.add_paragraph()
        p_e.text = f"Account: {d_email}"
        p_e.font.size = Pt(11)
        p_e.font.bold = True
        p_e.font.color.rgb = ROSE_PRIMARY
        p_e.space_after = Pt(8)

        for b in d_bullets:
            p_b = tf.add_paragraph()
            p_b.text = f"✔ {b}"
            p_b.font.size = Pt(11)
            p_b.font.color.rgb = LIGHT_GRAY
            p_b.space_before = Pt(4)

    # Bottom Gateway Banner
    add_card(slide5, Inches(0.9), Inches(5.4), Inches(11.5), Inches(1.4), CARD_BG, ROSE_PRIMARY)
    tb_gw = slide5.shapes.add_textbox(Inches(1.1), Inches(5.5), Inches(11.1), Inches(1.2))
    tf_gw = tb_gw.text_frame
    tf_gw.word_wrap = True

    p_gw1 = tf_gw.paragraphs[0]
    p_gw1.text = "⚡ REAL-TIME WEBSOCKET GATEWAY (ws://<IP>:5000/ws)"
    p_gw1.font.size = Pt(13)
    p_gw1.font.bold = True
    p_gw1.font.color.rgb = ROSE_PRIMARY

    p_gw2 = tf_gw.add_paragraph()
    p_gw2.text = "All status changes, risk score updates, and escalations synchronize across all three devices in <100ms. If network drops, the client automatically switches to resilient 3-second polling fallback, ensuring zero dropped SOS alerts."
    p_gw2.font.size = Pt(12)
    p_gw2.font.color.rgb = LIGHT_GRAY

    add_speaker_note(slide5,
        "SATHANDHURKES: Many hackathon projects fake their demos by storing everything in local storage on a single browser tab. We built a real, distributed three-tier system.\n\n"
        "HARSHIKA: Person, Mom, and Dad are three distinct registered accounts with their own JWT sessions, linked via circle invitations in our persistent atomic database, and connected live over a sub-100ms WebSocket gateway."
    )

    # =========================================================================
    # SLIDE 6: NATIVE ANDROID DISCREET MODE
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    add_background(slide6)
    add_header(slide6, "Native Android Discreet Mode & Camouflage", "NATIVE INTEGRATION")

    col6_w = Inches(5.6)
    col6_gap = Inches(0.3)
    top6 = Inches(1.8)
    h6 = Inches(4.8)

    # Left: Launcher Alias Disguise
    add_card(slide6, Inches(0.9), top6, col6_w, h6, CARD_BG, CARD_BORDER)
    tb_l = slide6.shapes.add_textbox(Inches(1.1), top6 + Inches(0.3), col6_w - Inches(0.4), h6 - Inches(0.6))
    tf_l = tb_l.text_frame
    tf_l.word_wrap = True

    p_l1 = tf_l.paragraphs[0]
    p_l1.text = "1. Native Launcher Alias Switching"
    p_l1.font.size = Pt(18)
    p_l1.font.bold = True
    p_l1.font.color.rgb = ROSE_PRIMARY

    points_l = [
        ("Android Activity-Alias", "Configured in AndroidManifest.xml with 3 distinct launcher aliases: SafeCircle, Calculator, and Notes."),
        ("Dynamic Icon Change", "Native Java plugin calls PackageManager.setComponentEnabledSetting() to swap home screen icons at runtime without killing the app."),
        ("Prying Eyes Protection", "If an aggressor inspects the user's phone, the app appears as a standard utility, eliminating suspicion.")
    ]
    for title, desc in points_l:
        p_pt = tf_l.add_paragraph()
        p_pt.text = f"• {title}: {desc}"
        p_pt.font.size = Pt(12)
        p_pt.font.color.rgb = LIGHT_GRAY
        p_pt.space_before = Pt(8)

    # Right: Calculator Camouflage & Silent SOS
    add_card(slide6, Inches(0.9) + col6_w + col6_gap, top6, col6_w, h6, CARD_BG, CARD_BORDER)
    tb_r = slide6.shapes.add_textbox(Inches(1.1) + col6_w + col6_gap, top6 + Inches(0.3), col6_w - Inches(0.4), h6 - Inches(0.6))
    tf_r = tb_r.text_frame
    tf_r.word_wrap = True

    p_r1 = tf_r.paragraphs[0]
    p_r1.text = "2. Functional Calculator & Secret PIN"
    p_r1.font.size = Pt(18)
    p_r1.font.bold = True
    p_r1.font.color.rgb = ROSE_PRIMARY

    points_r = [
        ("Working Scientific Calculator", "Performs real arithmetic calculations (25 * 4 = 100) to withstand manual inspection."),
        ("Private 4-Digit Unlock", "Typing secret PIN (e.g. 1234) and hitting '=' silently unlocks the SafeCircle dashboard."),
        ("Silent Coercion SOS", "Typing '911=' or '0000=' silently triggers a Level 4 Crisis Beacon to Mom and Dad without any screen flashing or alert sound.")
    ]
    for title, desc in points_r:
        p_pt = tf_r.add_paragraph()
        p_pt.text = f"• {title}: {desc}"
        p_pt.font.size = Pt(12)
        p_pt.font.color.rgb = LIGHT_GRAY
        p_pt.space_before = Pt(8)

    add_speaker_note(slide6,
        "HARSHIKA: In abusive or dangerous situations, an attacker may force a woman to show her phone. If they see a personal safety app, they might become violent.\n\n"
        "SATHANDHURKES: SafeCircle implements a custom native Android plugin that dynamically reconfigures the launcher icon to look like a standard Calculator or Notes app. Inside, the app functions as a real calculator. Entering 1234= unlocks the app, while typing 911= silently sends a crisis alert without alerting anyone nearby."
    )

    # =========================================================================
    # SLIDE 7: TECHNICAL REALISM & OS BOUNDARIES
    # =========================================================================
    slide7 = prs.slides.add_slide(blank_layout)
    add_background(slide7)
    add_header(slide7, "Engineering Integrity & Graceful Fallbacks", "TECHNICAL REALISM")

    col7_w = Inches(3.6)
    gap7 = Inches(0.3)
    top7 = Inches(1.8)
    h7 = Inches(4.8)

    realism = [
        ("Zero False Claims", ROSE_PRIMARY, [
            ("No Power-Off Tracking", "Mobile operating systems physically cut antenna power when powered down. We do not claim impossible miracles."),
            ("No Stealth Audio Snooping", "Android requires active foreground service notifications for mic access; we respect OS privacy guidelines."),
            ("No Task Switcher Bypass", "We rely on functional camouflage rather than trying to hack OS system processes.")
        ]),
        ("Graceful Degradation", EMERALD, [
            ("GPS Lost Fallback", "Dead-reckoning algorithm calculates last trajectory and broadcasts last known coordinate with accuracy radius."),
            ("Network Disconnection", "Client stores events in offline queue and falls back to SMS trigger generation."),
            ("Battery Depletion", "Last 5% battery automatically emits low-battery advisory to Mom before shutdown.")
        ]),
        ("Backend Heartbeat Guard", AMBER, [
            ("30-Second Inactivity Watchdog", "If a person's phone abruptly loses connection without de-escalation, backend flags as potential emergency."),
            ("Escalation Timer", "Configurable 3-minute grace period before notifying primary guardian of signal loss."),
            ("Server-Side Sanitization", "Coordinates stripped at API gateway before sending to guardians based on tier.")
        ])
    ]

    for idx, (title, color, items) in enumerate(realism):
        x = Inches(0.9) + idx * (col7_w + gap7)
        add_card(slide7, x, top7, col7_w, h7, CARD_BG, CARD_BORDER)

        tb = slide7.shapes.add_textbox(x + Inches(0.15), top7 + Inches(0.2), col7_w - Inches(0.3), h7 - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True

        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(16)
        p_t.font.bold = True
        p_t.font.color.rgb = color
        p_t.space_after = Pt(8)

        for heading, body in items:
            p_h = tf.add_paragraph()
            p_h.text = f"• {heading}"
            p_h.font.size = Pt(12)
            p_h.font.bold = True
            p_h.font.color.rgb = WHITE
            p_h.space_before = Pt(6)

            p_b = tf.add_paragraph()
            p_b.text = body
            p_b.font.size = Pt(11)
            p_b.font.color.rgb = LIGHT_GRAY

    add_speaker_note(slide7,
        "SATHANDHURKES: Many hackathon pitches make unbelievable claims, like tracking phones when turned off or secretly recording audio. In SafeCircle, we prioritize honest engineering.\n\n"
        "HARSHIKA: When signals die or battery drops below 5%, SafeCircle engages deterministic fallbacks: dead reckoning, last known coordinates, and server-side inactivity watchdogs that alert Mom if the phone goes dark unexpectedly."
    )

    # =========================================================================
    # SLIDE 8: TECHNOLOGY STACK & CODEBASE
    # =========================================================================
    slide8 = prs.slides.add_slide(blank_layout)
    add_background(slide8)
    add_header(slide8, "Modern, Lean & Scalable Architecture", "TECHNOLOGY STACK")

    box_w = Inches(5.6)
    box_gap = Inches(0.3)
    box_top = Inches(1.8)
    box_h = Inches(4.8)

    # Left: Frontend & Android
    add_card(slide8, Inches(0.9), box_top, box_w, box_h, CARD_BG, CARD_BORDER)
    tb_fe = slide8.shapes.add_textbox(Inches(1.1), box_top + Inches(0.2), box_w - Inches(0.4), box_h - Inches(0.4))
    tf_fe = tb_fe.text_frame
    tf_fe.word_wrap = True

    p_f = tf_fe.paragraphs[0]
    p_f.text = "Frontend & Mobile Engine"
    p_f.font.size = Pt(18)
    p_f.font.bold = True
    p_f.font.color.rgb = ROSE_PRIMARY

    fe_stack = [
        ("React 19 + Vite 6", "Blazing-fast rendering, modular hook-based state management, sub-100ms HMR."),
        ("Tailwind CSS", "Custom soft pink/rose palette (#e11d48, #be123c, #1f2937). Zero blue accents."),
        ("Capacitor 7 Native Runtime", "Direct bridge from web view to Android native APIs and background tasks."),
        ("Custom Java Plugin", "DiscreetModePlugin.java for dynamic Android launcher activity-alias switching."),
        ("Leaflet / OpenStreetMap", "Precise vector map rendering with privacy perimeter sector circles.")
    ]
    for t, d in fe_stack:
        p_item = tf_fe.add_paragraph()
        p_item.text = f"✔ {t}: {d}"
        p_item.font.size = Pt(11)
        p_item.font.color.rgb = LIGHT_GRAY
        p_item.space_before = Pt(8)

    # Right: Backend & Infrastructure
    add_card(slide8, Inches(0.9) + box_w + box_gap, box_top, box_w, box_h, CARD_BG, CARD_BORDER)
    tb_be = slide8.shapes.add_textbox(Inches(1.1) + box_w + box_gap, box_top + Inches(0.2), box_w - Inches(0.4), box_h - Inches(0.4))
    tf_be = tb_be.text_frame
    tf_be.word_wrap = True

    p_b = tf_be.paragraphs[0]
    p_b.text = "Backend & Real-Time Gateway"
    p_b.font.size = Pt(18)
    p_b.font.bold = True
    p_b.font.color.rgb = ROSE_PRIMARY

    be_stack = [
        ("Node.js + Express", "Modular REST API with structured controllers, route validators, and error middleware."),
        ("Atomic Persistent JSON DB", "Zero-dependency embedded datastore (safecircle_db.json). Zero MongoDB or lockup dependencies."),
        ("WebSocket Gateway (ws)", "Stateful duplex communication for instantaneous multi-device ward synchronization."),
        ("Authentication & Security", "JWT token headers, bcrypt password hashing, and real 6-digit email OTP generation."),
        ("Differential Privacy Filter", "Server-level coordinate stripping before payload broadcast.")
    ]
    for t, d in be_stack:
        p_item = tf_be.add_paragraph()
        p_item.text = f"✔ {t}: {d}"
        p_item.font.size = Pt(11)
        p_item.font.color.rgb = LIGHT_GRAY
        p_item.space_before = Pt(8)

    add_speaker_note(slide8,
        "SATHANDHURKES: Our stack is lightweight, resilient, and production ready. Frontend runs React 19 bundled inside Capacitor 7 for Android.\n\n"
        "HARSHIKA: The backend is powered by Node.js and WebSockets with an atomic persistent JSON database that runs everywhere without needing external database daemons. Every endpoint is secured with JWT and bcrypt."
    )

    # =========================================================================
    # SLIDE 9: LIVE DEMO PROTOCOL (7 SCENARIOS)
    # =========================================================================
    slide9 = prs.slides.add_slide(blank_layout)
    add_background(slide9)
    add_header(slide9, "3-Device Live Hackathon Demonstration", "LIVE DEMO PROTOCOL")

    table_shape9 = slide9.shapes.add_table(6, 4, Inches(0.9), Inches(1.8), Inches(11.5), Inches(4.8))
    t9 = table_shape9.table
    t9.columns[0].width = Inches(1.2)
    t9.columns[1].width = Inches(3.2)
    t9.columns[2].width = Inches(3.4)
    t9.columns[3].width = Inches(3.7)

    headers9 = ["Time", "Person's Device (User)", "Mom's Screen (Guardian 1)", "Dad's Screen (Guardian 2)"]
    for c_idx, h in enumerate(headers9):
        cell = t9.cell(0, c_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = ROSE_DEEP
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.bold = True
        p.font.size = Pt(12)
        p.font.color.rgb = WHITE

    demo_steps = [
        ("0:00", "Starts SafePath journey to Home", "Ward card: 'In Transit (Safe)'\nExact GPS is HIDDEN", "Ward card: 'In Transit (Safe)'\nExact GPS is HIDDEN"),
        ("0:45", "Triggers Route Detour (Caution)", "Status turns Amber: Detour Notice\nGPS remains protected", "Status turns Amber: Detour Notice\nGPS remains protected"),
        ("1:20", "Missed Check-In (Elevated)", "ALERT: Approximate 1km area unlocked\nBattery: 84% shared", "Remains on Standby\nNo alert triggered"),
        ("2:00", "Triggers Crisis Panic SOS", "Full Emergency Override\nLive GPS pin + Medical data", "Full Emergency Override\nLive GPS pin + Medical data"),
        ("2:45", "Taps 'I Am Safe' (De-escalate)", "Privacy restored instantly\nCoordinates wiped from stream", "Privacy restored instantly\nCoordinates wiped from stream")
    ]

    for r_idx, (tm, pers, mom, dad) in enumerate(demo_steps, start=1):
        for c_idx, val in enumerate([tm, pers, mom, dad]):
            c = t9.cell(r_idx, c_idx)
            c.fill.solid()
            c.fill.fore_color.rgb = CARD_BG
            p = c.text_frame.paragraphs[0]
            p.text = val
            p.font.size = Pt(11)
            p.font.color.rgb = WHITE if c_idx == 0 else LIGHT_GRAY
            if c_idx == 0:
                p.font.bold = True

    add_speaker_note(slide9,
        "SATHANDHURKES: Now, judges, let us demonstrate this live across our devices.\n\n"
        "HARSHIKA: Notice Person starts a trip. On Mom and Dad's screens, she shows as 'In Transit', but her coordinates are completely hidden. When we simulate a route deviation, risk score increases to 30. Mom gets an advisory, but still no GPS.\n\n"
        "SATHANDHURKES: Only when we trigger Crisis SOS do both parents receive the exact pin and medical info. And when Person taps 'I Am Safe', all tracking instantly disappears."
    )

    # =========================================================================
    # SLIDE 10: ROADMAP, IMPACT & CLOSING
    # =========================================================================
    slide10 = prs.slides.add_slide(blank_layout)
    add_background(slide10)
    add_header(slide10, "Future Roadmap & Market Impact", "THE FUTURE")

    col10_w = Inches(3.6)
    gap10 = Inches(0.3)
    top10 = Inches(1.8)
    h10 = Inches(3.4)

    phases = [
        ("Phase 1: Campus Pilots", ROSE_PRIMARY, [
            "University student union partnerships",
            "Campus security & safe-walk escort integration",
            "Anonymous peer-escort volunteer network"
        ]),
        ("Phase 2: Hardware & OEM", WHITE, [
            "Android power-button triple-tap hardware trigger",
            "Wear OS & smart watch haptic confirmation",
            "Emergency satellite messaging integration"
        ]),
        ("Phase 3: B2B Enterprise", WHITE, [
            "Corporate night-shift commute safety",
            "Hospitality and healthcare worker protection",
            "Zero-knowledge encrypted compliance reports"
        ])
    ]

    for idx, (p_title, p_color, p_bullets) in enumerate(phases):
        x = Inches(0.9) + idx * (col10_w + gap10)
        add_card(slide10, x, top10, col10_w, h10, CARD_BG, CARD_BORDER)

        tb = slide10.shapes.add_textbox(x + Inches(0.15), top10 + Inches(0.2), col10_w - Inches(0.3), h10 - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True

        p_t = tf.paragraphs[0]
        p_t.text = p_title
        p_t.font.size = Pt(15)
        p_t.font.bold = True
        p_t.font.color.rgb = p_color
        p_t.space_after = Pt(8)

        for b in p_bullets:
            p_b = tf.add_paragraph()
            p_b.text = f"✔ {b}"
            p_b.font.size = Pt(11)
            p_b.font.color.rgb = LIGHT_GRAY
            p_b.space_before = Pt(6)

    # Bottom Closing Card
    add_card(slide10, Inches(0.9), Inches(5.4), Inches(11.5), Inches(1.5), CARD_BG, ROSE_PRIMARY)
    tb_close = slide10.shapes.add_textbox(Inches(1.1), Inches(5.5), Inches(11.1), Inches(1.3))
    tf_close = tb_close.text_frame
    tf_close.word_wrap = True

    p_c1 = tf_close.paragraphs[0]
    p_c1.text = "\"SafeCircle gives women their independence back by replacing 24/7 surveillance with intelligent, progressive protection.\""
    p_c1.font.size = Pt(15)
    p_c1.font.italic = True
    p_c1.font.bold = True
    p_c1.font.color.rgb = WHITE

    p_c2 = tf_close.add_paragraph()
    p_c2.text = "Thank you!  •  Team Hellfire Club  •  Sathandhurkes & Harshika  •  Questions & Answers"
    p_c2.font.size = Pt(13)
    p_c2.font.bold = True
    p_c2.font.color.rgb = ROSE_PRIMARY
    p_c2.space_before = Pt(6)

    add_speaker_note(slide10,
        "HARSHIKA: SafeCircle is more than an app; it is a philosophy that safety and privacy are not opposing forces. They must reinforce each other.\n\n"
        "SATHANDHURKES: We thank the judges and audience for your time. Harshika and I are ready to answer any questions or dive into any component of the live code or architecture."
    )

    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "SafeCircle_Presentation_Hellfire_Club.pptx")
    prs.save(output_path)
    print(f"Presentation saved successfully to: {os.path.abspath(output_path)}")

if __name__ == "__main__":
    create_presentation()
