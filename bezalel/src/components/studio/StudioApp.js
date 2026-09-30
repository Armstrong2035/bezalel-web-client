"use client";

import { useMemo, useRef, useState } from "react";
import { useLoadingRouter as useRouter } from "@/app/hooks/useNavigationLoading";
import dynamic from "next/dynamic";
import { StudioNavigation } from "./StudioNavigation";
import LoadingState from "@/components/loading/LoadingState";

const OpportunityView = dynamic(() => import("./OpportunityView"), { loading: () => <LoadingState compact label="Loading opportunities..." /> });

const businessDocuments = [
  { id: "poysis-model", title: "Poysis", goal: "Find and validate a daily research-inbox habit for business people and creatives." },
  { id: "christian-content-model", title: "Christian Content", goal: "Create thoughtful, evidence-led content for people exploring faith and suffering." },
  { id: "bezalel-model", title: "Bezalel", goal: "Help founders turn business-model decisions into useful market action." },
];

const businesses = [
  { ...businessDocuments[0], idea: "AI orchestration for useful research and action.", priority: "Prove the research inbox is a daily habit." },
  { ...businessDocuments[1], idea: "Thoughtful, evidence-led Christian content.", priority: "Test whether reflective video earns meaningful engagement." },
  { ...businessDocuments[2], idea: "A decision workspace for founders.", priority: "Turn business-model choices into market action." },
];


const actionLabels = {
  write_post: "Create SEO Brief",
  create_carousel: "Create Carousel Brief",
  create_video: "Create Video Brief",
  research_deeper: "Research Deeper",
};

export default function StudioApp({ document, onOpenBusinessModel, hideSidebar = false, activeView, onViewChange, canvasIdeas = [] }) {
  const router = useRouter();
  const [internalView, setInternalView] = useState(document ? "overview" : "home");
  const view = activeView ?? internalView;
  const setView = onViewChange ?? setInternalView;
  const [activeBusinessId, setActiveBusinessId] = useState(document?.id ?? null);
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [reply, setReply] = useState("");
  const [replySubmitted, setReplySubmitted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [job, setJob] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [published, setPublished] = useState([]);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const activeBusiness = document ?? businesses.find((business) => business.id === activeBusinessId) ?? null;
  const activeItem = items.find((item) => item.id === activeId && item.document?.id === activeBusinessId) ?? items.find((item) => item.document?.id === activeBusinessId) ?? null;
  const categories = ["All", "Unread", "CHRISTIANITY", "AI", "POYSIS", "Business"];
  const visibleItems = useMemo(() => items.filter((item) => {
    const matchesFilter = filter === "All" || (filter === "Unread" ? item.status === "unread" : item.category === filter);
    const haystack = `${item.title} ${item.summary} ${item.category}`.toLowerCase();
    return item.document?.id === activeBusinessId && matchesFilter && haystack.includes(search.toLowerCase());
  }), [activeBusinessId, filter, items, search]);

  const openBusiness = (businessId) => {
    setActiveBusinessId(businessId);
    const firstItem = items.find((item) => item.document?.id === businessId);
    if (firstItem) setActiveId(firstItem.id);
    setReply("");
    setReplySubmitted(false);
    setJob(null);
    setView("inbox");
  };

  const chooseItem = (id) => {
    setActiveId(id);
    setReply("");
    setReplySubmitted(false);
    setJob(null);
    setItems((current) => current.map((item) => item.id === id ? { ...item, status: item.status === "unread" ? "read" : item.status } : item));
  };

  const attachDocument = (documentId) => {
    const document = businessDocuments.find((item) => item.id === documentId);
    if (!document) return;
    setItems((current) => current.map((item) => item.id === activeItem.id ? { ...item, document } : item));
  };

  const submitReply = () => {
    if (!reply.trim()) return;
    setReplySubmitted(true);
    setItems((current) => current.map((item) => item.id === activeItem.id ? { ...item, status: "replied" } : item));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => chunksRef.current.push(event.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const url = URL.createObjectURL(new Blob(chunksRef.current, { type: "audio/webm" }));
        setAudioUrl(url);
        setTranscribing(true);
        setTimeout(() => {
          setReply((current) => current || "I think the mistake people are making here is assuming a quick answer will make suffering feel less real. I want to speak about faith without pretending certainty is the same as comfort.");
          setTranscribing(false);
        }, 900);
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      setReply("Voice recording is unavailable in this browser. Add your response here instead.");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const runAction = (action) => {
    const artifact = {
      id: `artifact-${Date.now()}`,
      type: action.replace("create_", "").replace("write_", ""),
      action,
      documentId: activeItem.document?.id ?? null,
      documentTitle: activeItem.document?.title ?? null,
      title: activeItem.title,
      caption: reply.trim(),
      profile: "Armstrong Main",
      status: "Generating",
      createdAt: "Just now",
    };
    setJob({ action, artifact, stage: 0, status: "planning" });
    [700, 1500, 2400, 3300].forEach((delay, stage) => {
      setTimeout(() => {
        setJob((current) => current ? { ...current, stage: stage + 1, status: stage === 3 ? "ready" : "executing" } : current);
        if (stage === 3) setDrafts((current) => [{ ...artifact, status: "Ready" }, ...current]);
      }, delay);
    });
  };

  const approve = () => {
    if (!job?.artifact) return;
    setPublished((current) => [{ ...job.artifact, status: "Published", createdAt: "Today" }, ...current]);
    setDrafts((current) => current.filter((draft) => draft.id !== job.artifact.id));
    setJob(null);
    setView("published");
  };

  return (
    <div className="studio-app" style={styles.app}>
      {!hideSidebar && <StudioSidebar view={view} setView={setView} activeBusiness={activeBusiness} openHome={() => document ? router.push("/documents") : setView("home")} />}
      <main style={styles.main}>
        <header style={styles.topbar}>
          <div><p style={styles.eyebrow}>{view === "home" ? "BEZALEL" : activeBusiness?.title ?? "BEZALEL"}</p><h1 style={styles.pageTitle}>{view === "home" ? "My Businesses" : titleFor(view)}</h1></div>
          <input aria-label="Search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Bezalel" style={styles.search} />
        </header>
        {view === "home" && <HomeView businesses={businesses} items={items} openBusiness={openBusiness} />}
        {view === "overview" && <OverviewView business={activeBusiness} items={items} openBusiness={() => setView("inbox")} openCarousel={() => setView("carousel")} />}
        {view === "inbox" && activeItem && <InboxView items={visibleItems} activeItem={activeItem} chooseItem={chooseItem} filter={filter} setFilter={setFilter} categories={categories} reply={reply} setReply={setReply} replySubmitted={replySubmitted} recording={recording} transcribing={transcribing} audioUrl={audioUrl} startRecording={startRecording} stopRecording={stopRecording} submitReply={submitReply} job={job} runAction={runAction} approve={approve} attachDocument={attachDocument} />}
        {view === "inbox" && !activeItem && <EmptyBusinessInbox business={activeBusiness} />}
        {view === "drafts" && <ArtifactList label="Drafts" artifacts={drafts.filter((artifact) => artifact.documentId === activeBusinessId)} empty="Your approved work-in-progress will appear here." />}
        {view === "published" && <ArtifactList label="Published" artifacts={published.filter((artifact) => artifact.documentId === activeBusinessId)} empty="Nothing has been published yet. Approval always comes first." />}
        {view === "projects" && <ProjectsView />}
        {view === "automations" && <AutomationsView />}
        {view === "sources" && <OpportunityView key={document?.id ?? "preview"} documentId={document?.id} initialForm={document?.opportunityForm} canvasIdeas={canvasIdeas} />}
        {view === "carousel" && <CarouselView item={activeItem} onBack={() => setView("inbox")} />}
        {view === "settings" && <SettingsView />}
        {view === "business" && <BusinessBridge router={router} onOpenBusinessModel={onOpenBusinessModel} />}
      </main>
    </div>
  );
}

function StudioSidebar({ view, setView, activeBusiness, openHome }) {
  return <aside className="studio-sidebar" style={styles.sidebar}><button onClick={openHome} style={styles.brand}>BEZALEL</button><button onClick={() => setView("overview")} style={{ ...styles.navItem, ...(view === "overview" ? styles.navActive : {}) }}>Overview</button><StudioNavigation view={view} setView={setView} documentTitle={activeBusiness?.title} /><div style={styles.sidebarFoot}><span style={styles.dot} />3 new opportunities</div></aside>;
}

function OverviewView({ business, items, openBusiness, openCarousel }) {
  const activity = items.filter((item) => !business?.id || item.document?.id === business.id);
  const unread = activity.filter((item) => item.status === "unread");
  return <section style={overviewStyles.page}>
    <div style={overviewStyles.heading}><div><p style={styles.eyebrow}>WORKSPACE OVERVIEW</p><h2 style={overviewStyles.title}>Useful work, in one place.</h2><p style={overviewStyles.lead}>Research, decisions, and drafts stay attached to the document they belong to.</p></div><button onClick={openBusiness} style={styles.primaryButton}>Open inbox →</button></div>
    <div style={overviewStyles.grid}>
      <section style={{ ...overviewStyles.card, gridColumn: "span 7" }}><div style={overviewStyles.cardHead}><h3>Documents</h3><span>{business?.title ?? "Active workspace"}</span></div><button onClick={openBusiness} style={overviewStyles.documentRow}><span style={overviewStyles.docDot} /><span><strong>{business?.title ?? "Business workspace"}</strong><small>{business?.goal || "Canvas, research, and content work"}</small></span><span style={overviewStyles.rowArrow}>→</span></button><button onClick={openBusiness} style={overviewStyles.documentRow}><span style={overviewStyles.docDot} /><span><strong>Research inbox</strong><small>{activity.length} attached updates across this workspace</small></span><span style={overviewStyles.rowArrow}>→</span></button></section>
      <section style={{ ...overviewStyles.card, gridColumn: "span 5" }}><div style={overviewStyles.cardHead}><h3>Needs your attention</h3><span style={overviewStyles.warn}>{unread.length || 0} waiting</span></div>{unread.length ? unread.slice(0, 3).map((item) => <button key={item.id} onClick={openBusiness} style={overviewStyles.activity}><strong>{item.title}</strong><small>{item.category} · {item.createdAt}</small></button>) : <p style={overviewStyles.empty}>Nothing urgent is waiting for you.</p>}</section>
      <section style={{ ...overviewStyles.card, gridColumn: "span 5" }}><div style={overviewStyles.cardHead}><h3>Automation results</h3><span>Planned</span></div><div style={overviewStyles.automation}><strong>Social listening</strong><small>Grokbot · topics ready to connect</small><b>Every 15 minutes</b></div><div style={overviewStyles.automation}><strong>Contact discovery</strong><small>Explorium · five new contacts</small><b>Every 12 hours</b></div></section>
      <section style={{ ...overviewStyles.card, gridColumn: "span 7" }}><div style={overviewStyles.cardHead}><h3>Recent activity</h3><span>Attached to this document</span></div>{activity.slice(0, 4).map((item) => <button key={item.id} onClick={openBusiness} style={overviewStyles.activity}><strong>{item.title}</strong><small>{item.summary}</small></button>)}<button onClick={openCarousel} style={{ ...styles.secondaryButton, marginTop: 14 }}>Create a carousel from an insight →</button></section>
    </div>
  </section>;
}

function CarouselView({ item, onBack }) {
  const slides = [
    { label: "01", title: item?.title || "Start with the question", copy: item?.summary || "Give the audience a reason to keep reading." },
    { label: "02", title: "Name the tension", copy: item?.why || "Make the problem clear before offering an answer." },
    { label: "03", title: "Show the evidence", copy: item?.evidence?.[0]?.excerpt || "Use a specific signal instead of a generic claim." },
    { label: "04", title: "Offer the angle", copy: item?.suggestedAngle || "Turn the insight into a perspective worth sharing." },
    { label: "05", title: "Invite a response", copy: "End with a question that gives the audience somewhere to go." },
  ];
  return <section style={carouselStyles.page}><button onClick={onBack} style={styles.back}>← Back to inbox</button><div style={carouselStyles.heading}><div><p style={styles.eyebrow}>CONTENT STUDIO · CAROUSEL</p><h2 style={carouselStyles.title}>Review the story before it leaves the workspace.</h2><p style={carouselStyles.lead}>This draft keeps the source insight visible, so you can shape the argument before exporting it.</p></div><button onClick={() => window.print()} style={styles.primaryButton}>Export review</button></div><div style={carouselStyles.rail}>{slides.map((slide) => <article key={slide.label} style={carouselStyles.slide}><span style={carouselStyles.number}>{slide.label}</span><h3>{slide.title}</h3><p>{slide.copy}</p></article>)}</div><div style={carouselStyles.footer}><span>5 slides · Draft · Approval required</span><button onClick={onBack} style={styles.secondaryButton}>Return to source</button></div></section>;
}

function HomeView({ businesses: allBusinesses, items, openBusiness }) {
  return <section style={homeStyles.home}><p style={homeStyles.homeIntro}>Choose a business to see research, create content, and learn what to do next.</p><div style={homeStyles.businessGrid}>{allBusinesses.map((business) => { const unread = items.filter((item) => item.document?.id === business.id && item.status === "unread").length; return <button key={business.id} onClick={() => openBusiness(business.id)} style={homeStyles.businessCard}><span style={styles.itemCategory}>{unread ? `${unread} NEW OPPORTUNIT${unread === 1 ? "Y" : "IES"}` : "UP TO DATE"}</span><h2>{business.title}</h2><p>{business.idea}</p><div style={homeStyles.businessGoal}><span>Current validation goal</span><strong>{business.priority}</strong></div><span style={homeStyles.openBusiness}>Open workspace →</span></button>; })}</div><button style={{ ...styles.secondaryButton, marginTop: 24 }}>+ New business</button></section>;
}

function EmptyBusinessInbox({ business }) {
  return <section style={styles.module}><p style={styles.eyebrow}>{business?.title ?? "BUSINESS"}</p><div style={styles.empty}><h3>Nothing worth bothering you with right now.</h3><p>Poysis will surface research when it finds something useful for this business model.</p></div></section>;
}

function LegacyInboxView({ items, activeItem, chooseItem, filter, setFilter, categories, reply, setReply, replySubmitted, recording, transcribing, audioUrl, startRecording, stopRecording, submitReply, job, runAction, approve, attachDocument }) {
  return <div className="studio-inbox-layout" style={styles.inboxLayout}><section className="studio-list-pane" style={styles.listPane}><div style={styles.filters}>{categories.map((category) => <button key={category} onClick={() => setFilter(category)} style={{ ...styles.filter, ...(filter === category ? styles.filterActive : {}) }}>{category}</button>)}</div>{items.length ? items.map((item) => <button key={item.id} onClick={() => chooseItem(item.id)} style={{ ...styles.item, ...(activeItem.id === item.id ? styles.itemActive : {}) }}><span style={styles.itemCategory}>{item.category}</span><strong style={styles.itemTitle}>{item.title}</strong><span style={styles.itemSummary}>{item.summary}</span><span style={styles.itemFooter}>{item.document?.title ? `${item.document.title} · ` : ""}{item.evidence.map((e) => e.source).join(" · ")} <em>{item.createdAt}</em></span></button>) : <EmptyInbox />}</section><section className="studio-read-pane" style={styles.readPane}><ResearchDetail item={activeItem} reply={reply} setReply={setReply} replySubmitted={replySubmitted} recording={recording} transcribing={transcribing} audioUrl={audioUrl} startRecording={startRecording} stopRecording={stopRecording} submitReply={submitReply} job={job} runAction={runAction} approve={approve} attachDocument={attachDocument} /></section></div>;
}

function InboxView({ items, activeItem, chooseItem, filter, setFilter, categories, reply, setReply, recording, transcribing, audioUrl, startRecording, stopRecording, submitReply, job, runAction, approve, attachDocument }) {
  return <div className="studio-inbox-layout" style={styles.inboxLayout}>
    <section className="studio-list-pane" style={styles.listPane}>
      <div style={styles.filters}>{categories.map((category) => <button key={category} onClick={() => setFilter(category)} style={{ ...styles.filter, ...(filter === category ? styles.filterActive : {}) }}>{category}</button>)}</div>
      {items.length ? items.map((item) => <button key={item.id} onClick={() => chooseItem(item.id)} style={{ ...styles.item, ...(activeItem.id === item.id ? styles.itemActive : {}) }}><span style={styles.itemCategory}>{item.category}</span><strong style={styles.itemTitle}>{item.title}</strong><span style={styles.itemSummary}>{item.summary}</span><span style={styles.itemFooter}>{item.document?.title ? item.document.title + " · " : ""}{item.evidence.map((e) => e.source).join(" · ")} <em>{item.createdAt}</em></span></button>) : <EmptyInbox />}
    </section>
    <section className="studio-read-pane" style={styles.readPane}>
      <ResearchDetail item={activeItem} reply={reply} setReply={setReply} replySubmitted={false} recording={recording} transcribing={transcribing} audioUrl={audioUrl} startRecording={startRecording} stopRecording={stopRecording} submitReply={submitReply} job={job} runAction={runAction} approve={approve} attachDocument={attachDocument} />
      {!job && <BriefActionPanel runAction={runAction} />}
    </section>
  </div>;
}

function BriefActionPanel({ runAction }) {
  const choices = [
    ["write_post", "Build SEO opportunity", "Turn search demand into a keyword cluster and page brief."],
    ["create_carousel", "Create carousel", "Turn this insight into a slide story for Instagram or TikTok."],
    ["create_video", "Create AI UGC concept", "Turn the evidence into a creator-led video concept and script."],
    ["research_deeper", "Research deeper", "Find more evidence before choosing a distribution surface."],
  ];
  return <section style={briefActionStyles.panel}>
    <p style={styles.sectionHeading}>CREATE FROM THIS BRIEF</p>
    <h3 style={briefActionStyles.title}>Where should this insight go?</h3>
    <p style={briefActionStyles.intro}>Your note above becomes a constraint for the draft. Nothing publishes or runs automatically.</p>
    <div style={briefActionStyles.grid}>{choices.map(([action, label, reason]) => <button key={action} onClick={() => runAction(action)} style={briefActionStyles.card}><strong>{label}</strong><span>{reason}</span></button>)}</div>
    <div style={briefActionStyles.footer}><button style={styles.noteButton}>Save for later</button><button style={styles.noteButton}>Add to research target</button></div>
  </section>;
}

function ResearchDetail({ item, reply, setReply, replySubmitted, recording, transcribing, audioUrl, startRecording, stopRecording, submitReply, job, runAction, approve, attachDocument }) {
  return <div style={styles.readContent}><button style={styles.back}>← Inbox</button><p style={styles.itemCategory}>{item.category}</p><h2 style={styles.readTitle}>{item.title}</h2><DocumentAttachment document={item.document} attachDocument={attachDocument} /><DetailSection heading="Why this matters"><p>{item.why}</p></DetailSection><DetailSection heading="Evidence">{item.evidence.map((e) => <div key={e.source} style={styles.evidence}><strong>{e.source}{e.metric ? <span style={styles.metric}>{e.metric}</span> : null}</strong><p>{e.excerpt}</p></div>)}</DetailSection><DetailSection heading="Possible angle"><p style={styles.angle}>“{item.suggestedAngle}”</p></DetailSection>{!replySubmitted && !job && <div style={styles.replyBox}><label htmlFor="reply" style={styles.replyLabel}>Reply with your take</label><textarea id="reply" value={reply} onChange={(event) => setReply(event.target.value)} placeholder="What do you think? Your original response is always preserved." style={styles.textarea} />{audioUrl && <audio controls src={audioUrl} style={{ width: "100%", marginBottom: 10 }} />}{transcribing && <p style={styles.muted}>Transcribing your response…</p>}<div style={styles.replyActions}>{recording ? <button onClick={stopRecording} style={styles.stopButton}>● Stop recording</button> : <button onClick={startRecording} style={styles.secondaryButton}>🎙 Record voice</button>}<button onClick={submitReply} disabled={!reply.trim() || transcribing} style={styles.primaryButton}>Submit reply</button></div></div>}{replySubmitted && !job && <div style={styles.actionBox}><p style={styles.actionQuestion}>What do you want to do with this?</p><div style={styles.actionGrid}>{Object.entries(actionLabels).map(([action, label]) => <button key={action} onClick={() => runAction(action)} style={styles.actionButton}>{label}</button>)}</div><button style={styles.noteButton}>Save as note</button><button style={styles.noteButton}>Add to project</button></div>}{job && <JobPanel job={job} approve={approve} />}</div>;
}

function DocumentAttachment({ document, attachDocument }) {
  return <section style={styles.documentAttachment}><p style={styles.attachmentLabel}>RESEARCH GOAL FROM BUSINESS MODEL</p><strong>{document?.title ?? "No business model attached"}</strong>{document?.goal && <p>{document.goal}</p>}<select aria-label="Attached business model" value={document?.id ?? ""} onChange={(event) => attachDocument(event.target.value)} style={styles.documentSelect}><option value="" disabled>Attach a business model</option>{businessDocuments.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></section>;
}

function JobPanel({ job, approve }) { const labels = ["Understanding your response", "Planning the story", "Selecting visuals", job.action === "create_video" ? "Rendering video" : "Preparing content", "Preparing preview"]; const ready = job.status === "ready"; return <div style={styles.job}><p style={styles.jobTitle}>{ready ? "Preview ready" : `Creating your ${actionLabels[job.action].toLowerCase()}`}</p>{labels.map((label, index) => <p key={label} style={styles.jobStep}>{index < job.stage ? "✓" : index === job.stage ? "●" : "○"} {label}</p>)}{ready && <div style={styles.preview}><div style={styles.mediaPlaceholder}>{job.action === "create_video" ? "VIDEO PREVIEW" : job.action === "create_carousel" ? "CAROUSEL PREVIEW" : "POST PREVIEW"}</div><h3>{job.artifact.title}</h3><p>{job.artifact.caption}</p><p style={styles.muted}>Armstrong Main · Approval required</p><div style={styles.replyActions}><button style={styles.secondaryButton}>Edit</button><button style={styles.secondaryButton}>Regenerate</button><button onClick={approve} style={styles.primaryButton}>Approve & publish</button></div></div>}</div>; }

function DetailSection({ heading, children }) { return <section style={styles.detailSection}><h3 style={styles.sectionHeading}>{heading}</h3>{children}</section>; }
function EmptyInbox() { return <div style={styles.empty}><h3>Nothing worth bothering you with right now.</h3><p>We’ll surface something when there’s something worth your attention.</p></div>; }
function ArtifactList({ label, artifacts, empty }) { return <section style={styles.module}><p style={styles.eyebrow}>{label.toUpperCase()}</p>{artifacts.length ? artifacts.map((artifact) => <article key={artifact.id} style={styles.artifact}><span style={styles.artifactType}>{artifact.type}</span><div><h3>{artifact.title}</h3><p>{artifact.status} · {artifact.createdAt}</p></div></article>) : <div style={styles.empty}><h3>{empty}</h3></div>}</section>; }
function ProjectsView() { return <section style={styles.module}><p style={styles.eyebrow}>PROJECTS</p>{["Poysis", "Christian Content", "Bezalel", "Chess Product"].map((project) => <article key={project} style={styles.project}><h3>{project}</h3><p>Research, replies, and content are kept in this context.</p></article>)}</section>; }
function AutomationsView() { return <section style={styles.module}><p style={styles.eyebrow}>AUTOMATIONS</p><article style={styles.rule}><h3>Christian Video</h3><p><strong>When</strong> I create a video from Christian research</p><p><strong>Use</strong> Armstrong Main · Anime · 60 seconds</p><p><strong>Approval</strong> Always ask</p></article></section>; }
function SettingsView() { return <section style={styles.module}><p style={styles.eyebrow}>SETTINGS</p><article style={styles.rule}><h3>Armstrong Main</h3><p>Reflective · Conversational · Story-driven</p><p>Anime · 45–60 seconds · 9:16 · Captions on</p><p><strong>Approval:</strong> Always required</p></article></section>; }
function BusinessBridge({ router, onOpenBusinessModel }) { return <section style={styles.module}><p style={styles.eyebrow}>BUSINESS MODEL</p><h2 style={styles.readTitle}>Your model shapes this document’s research.</h2><p style={{ color: "#666", maxWidth: 580, lineHeight: 1.7 }}>The customer, problem, value proposition, channels, and priorities in this canvas determine what belongs in this validation inbox.</p><button onClick={onOpenBusinessModel ?? (() => router.push("/documents"))} style={{ ...styles.primaryButton, marginTop: 24 }}>Open Business Model</button></section>; }
function titleFor(view) { return ({ overview: "Overview", inbox: "Inbox", drafts: "Drafts", published: "Published", carousel: "Carousel", projects: "Projects", business: "Business Model", automations: "Automations", sources: "Opportunities", settings: "Settings" })[view] ?? "Inbox"; }

const briefActionStyles = {
  panel: { margin: "0 46px 56px", padding: "20px", border: "1px solid #dfe5de", borderRadius: 9, background: "#f8fbf8" },
  title: { margin: "0 0 7px", fontSize: 19, letterSpacing: "-0.02em" },
  intro: { margin: "0 0 16px", color: "#686862", fontSize: 13, lineHeight: 1.55 },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 },
  card: { minHeight: 94, display: "grid", alignContent: "start", gap: 7, padding: "13px", border: "1px solid #d8ded7", borderRadius: 7, background: "#fff", color: "#30302d", textAlign: "left", font: "inherit", fontSize: 12, lineHeight: 1.45, cursor: "pointer" },
  footer: { marginTop: 5 },
};

const homeStyles = {
  activeBusiness: { margin: "18px 10px 4px", padding: "12px", border: "1px solid #e0e0da", borderRadius: 7, background: "#fff" },
  activeBusinessLabel: { display: "block", marginBottom: 5, color: "#898983", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em" },
  home: { maxWidth: 1040, padding: "48px 42px 72px", margin: "0 auto" },
  homeIntro: { maxWidth: 520, margin: "0 0 30px", color: "#6c6c67", fontSize: 15, lineHeight: 1.6 },
  businessGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 },
  businessCard: { minHeight: 255, padding: 23, border: "1px solid #e0e0da", borderRadius: 9, background: "#fff", color: "#20201f", textAlign: "left", font: "inherit", cursor: "pointer", boxShadow: "0 1px 1px rgba(0,0,0,.02)" },
  businessGoal: { marginTop: 24, paddingTop: 15, borderTop: "1px solid #e9e9e4", display: "grid", gap: 4, color: "#696963", fontSize: 12, lineHeight: 1.45 },
  openBusiness: { display: "block", marginTop: 20, color: "#28704a", fontSize: 12, fontWeight: 700 },
};

const overviewStyles = {
  page: { maxWidth: 1080, padding: "42px 42px 70px", margin: "0 auto" },
  heading: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, marginBottom: 28 },
  title: { margin: "0 0 8px", fontSize: 30, letterSpacing: "-0.04em" },
  lead: { maxWidth: 570, margin: 0, color: "#686862", fontSize: 14, lineHeight: 1.6 },
  grid: { display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: 14 },
  card: { minHeight: 150, padding: 20, border: "1px solid #e0e0da", borderRadius: 10, background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,.02)" },
  cardHead: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 16 },
  cardHeadTitle: { fontSize: 16 },
  cardHeadNote: { color: "#888", fontSize: 11 },
  documentRow: { width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 0", border: 0, borderTop: "1px solid #eeeeea", background: "transparent", textAlign: "left", cursor: "pointer", font: "inherit" },
  docDot: { width: 9, height: 9, borderRadius: 99, background: "#2f7d52", flexShrink: 0 },
  documentRowText: { display: "grid", gap: 3, minWidth: 0 },
  documentRowSmall: { color: "#80807a", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  rowArrow: { marginLeft: "auto", color: "#999", fontSize: 18 },
  warn: { color: "#8a5a12", background: "#f8efd9", borderRadius: 99, padding: "3px 8px", fontSize: 11 },
  activity: { width: "100%", display: "grid", gap: 3, padding: "10px 0", border: 0, borderTop: "1px solid #eeeeea", background: "transparent", textAlign: "left", cursor: "pointer", font: "inherit" },
  activitySmall: { color: "#80807a", fontSize: 12, lineHeight: 1.45 },
  empty: { color: "#85857e", fontSize: 13 },
  automation: { display: "grid", gap: 3, padding: "10px 0", borderTop: "1px solid #eeeeea", fontSize: 13 },
  automationSmall: { color: "#80807a", fontSize: 12 },
  automationB: { color: "#2f7d52", fontSize: 11, fontWeight: 600 },
};

const carouselStyles = {
  page: { maxWidth: 1080, padding: "30px 42px 70px", margin: "0 auto" },
  heading: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, margin: "12px 0 28px" },
  title: { maxWidth: 680, margin: "0 0 8px", fontSize: 30, letterSpacing: "-0.04em" },
  lead: { maxWidth: 600, margin: 0, color: "#686862", fontSize: 14, lineHeight: 1.6 },
  rail: { display: "grid", gridTemplateColumns: "repeat(5, minmax(150px, 1fr))", gap: 12, overflowX: "auto", paddingBottom: 8 },
  slide: { minHeight: 280, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 18, border: "1px solid #dfe5de", borderRadius: 10, background: "linear-gradient(160deg,#f7fbf8,#e5eee9)", boxShadow: "0 5px 14px rgba(28,62,47,.06)" },
  number: { alignSelf: "flex-start", marginBottom: "auto", color: "#2f6f63", fontFamily: "monospace", fontSize: 12, fontWeight: 700 },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 18, color: "#777", fontSize: 12 },
};

const styles = { app: { minHeight: "100vh", display: "flex", background: "#fcfcfb", color: "#20201f" }, sidebar: { width: 220, minWidth: 220, borderRight: "1px solid #e7e7e2", background: "#f7f7f4", padding: "26px 12px", display: "flex", flexDirection: "column" }, brand: { background: "none", border: "none", padding: "0 10px 28px", textAlign: "left", fontSize: 14, letterSpacing: "0.1em", fontWeight: 800, cursor: "pointer" }, navGroup: { borderTop: "1px solid #e4e4df", marginTop: 14, paddingTop: 14 }, navItem: { display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", padding: "8px 10px", borderRadius: 6, color: "#656562", font: "inherit", fontSize: 13, cursor: "pointer" }, navActive: { background: "#e9e9e4", color: "#222", fontWeight: 650 }, sidebarFoot: { marginTop: "auto", padding: "10px", color: "#777", fontSize: 12 }, dot: { display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#4d9167", marginRight: 7 }, main: { flex: 1, minWidth: 0 }, topbar: { minHeight: 105, padding: "28px 42px 20px", display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-start", borderBottom: "1px solid #e7e7e2", background: "#fff" }, eyebrow: { color: "#8a8a85", fontSize: 10, letterSpacing: "0.1em", fontWeight: 700, marginBottom: 5 }, pageTitle: { fontSize: 28, letterSpacing: "-0.04em" }, search: { width: 210, border: "1px solid #e1e1dc", borderRadius: 6, padding: "9px 11px", font: "inherit", fontSize: 13, outline: "none" }, inboxLayout: { display: "grid", gridTemplateColumns: "minmax(290px, 0.8fr) minmax(420px, 1.7fr)", minHeight: "calc(100vh - 105px)" }, listPane: { borderRight: "1px solid #e7e7e2", background: "#fff" }, filters: { padding: "15px 17px", display: "flex", flexWrap: "wrap", gap: 6, borderBottom: "1px solid #eee" }, filter: { border: "none", background: "transparent", padding: "4px 7px", color: "#777", borderRadius: 4, cursor: "pointer", fontSize: 11 }, filterActive: { background: "#ecece7", color: "#222", fontWeight: 700 }, item: { display: "flex", flexDirection: "column", width: "100%", textAlign: "left", background: "#fff", border: "none", borderBottom: "1px solid #efefeb", padding: "18px 20px", cursor: "pointer", gap: 5, font: "inherit" }, itemActive: { background: "#f5f5f1", boxShadow: "inset 3px 0 0 #454540" }, itemCategory: { color: "#7f7f79", fontSize: 10, letterSpacing: "0.09em", fontWeight: 750 }, itemTitle: { color: "#262624", fontSize: 14, lineHeight: 1.35 }, itemSummary: { color: "#74746e", fontSize: 12, lineHeight: 1.5 }, itemFooter: { color: "#9b9b95", fontSize: 10, marginTop: 3 }, readPane: { background: "#fcfcfb", overflow: "auto" }, readContent: { width: "min(680px, 100%)", padding: "30px 46px 72px", margin: "0 auto" }, back: { border: "none", background: "none", color: "#777", fontSize: 12, padding: "0 0 24px", cursor: "pointer" }, readTitle: { fontSize: 31, letterSpacing: "-0.045em", lineHeight: 1.15, margin: "6px 0 30px" }, documentAttachment: { padding: "15px 16px", margin: "0 0 22px", border: "1px solid #dfdfd8", borderRadius: 7, background: "#f7f7f3", color: "#565650", fontSize: 12, lineHeight: 1.55 }, attachmentLabel: { color: "#83837d", fontSize: 9, letterSpacing: "0.1em", fontWeight: 700, marginBottom: 5 }, documentSelect: { display: "block", width: "100%", marginTop: 10, border: "1px solid #d7d7d0", borderRadius: 5, background: "#fff", padding: "7px 8px", color: "#42423e", font: "inherit", fontSize: 12 }, detailSection: { padding: "20px 0", borderTop: "1px solid #e8e8e4", color: "#595955", fontSize: 14, lineHeight: 1.7 }, sectionHeading: { color: "#81817b", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }, evidence: { borderLeft: "2px solid #d8d8d1", paddingLeft: 13, marginBottom: 14 }, metric: { marginLeft: 8, color: "#2f7d52", fontWeight: 600, fontSize: 11 }, angle: { color: "#333", fontFamily: "Georgia, serif", fontSize: 17, lineHeight: 1.6 }, replyBox: { borderTop: "1px solid #ddd", paddingTop: 22, marginTop: 12 }, replyLabel: { display: "block", fontWeight: 700, fontSize: 13, marginBottom: 8 }, textarea: { width: "100%", minHeight: 120, resize: "vertical", border: "1px solid #dcdcd6", borderRadius: 7, padding: 12, font: "inherit", fontSize: 14, lineHeight: 1.6, outline: "none" }, replyActions: { display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: 9, marginTop: 11 }, primaryButton: { border: "none", background: "#272725", color: "#fff", padding: "9px 13px", borderRadius: 6, font: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer" }, secondaryButton: { border: "1px solid #d8d8d2", background: "#fff", color: "#4d4d49", padding: "9px 12px", borderRadius: 6, font: "inherit", fontSize: 12, cursor: "pointer" }, stopButton: { border: "1px solid #e8b9b9", background: "#fff6f6", color: "#a24242", padding: "9px 12px", borderRadius: 6, font: "inherit", fontSize: 12, cursor: "pointer" }, muted: { color: "#92928c", fontSize: 12, marginTop: 8 }, actionBox: { borderTop: "1px solid #ddd", paddingTop: 22, marginTop: 12 }, actionQuestion: { fontSize: 15, fontWeight: 700, marginBottom: 12 }, actionGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }, actionButton: { border: "1px solid #dcdcd6", background: "#fff", borderRadius: 6, padding: "12px 10px", textAlign: "left", font: "inherit", fontWeight: 600, fontSize: 12, cursor: "pointer" }, noteButton: { background: "none", border: "none", color: "#777", padding: "12px 9px 0 0", marginRight: 8, font: "inherit", fontSize: 12, cursor: "pointer" }, job: { borderTop: "1px solid #ddd", paddingTop: 24, marginTop: 12 }, jobTitle: { fontWeight: 700, marginBottom: 12 }, jobStep: { fontSize: 13, margin: "7px 0", color: "#666" }, preview: { marginTop: 22, background: "#fff", border: "1px solid #e0e0da", borderRadius: 8, padding: 18 }, mediaPlaceholder: { minHeight: 180, borderRadius: 5, display: "grid", placeItems: "center", background: "#e9e9e4", color: "#777", fontSize: 11, letterSpacing: "0.1em", marginBottom: 15 }, module: { padding: "42px", maxWidth: 820 }, empty: { padding: "44px 25px", color: "#777", fontSize: 14, lineHeight: 1.7 }, artifact: { display: "flex", gap: 15, alignItems: "center", borderBottom: "1px solid #e6e6e0", padding: "18px 0" }, artifactType: { minWidth: 72, color: "#888", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }, project: { padding: "17px 0", borderBottom: "1px solid #e6e6e0" }, rule: { padding: 20, border: "1px solid #e3e3dd", borderRadius: 8, lineHeight: 1.8, color: "#60605b" }, source: { display: "flex", justifyContent: "space-between", padding: "15px 0", borderBottom: "1px solid #e6e6e0", fontSize: 14 } };
