import { useState } from 'react';

const SCRIPTS = [
  {
    id: 'a',
    label: 'Variant A',
    sublabel: 'Pain-First',
    color: 'var(--accent)',
    badge: 'RECOMMENDED',
    sections: [
      {
        title: 'Open',
        content: (
          <>
            "Hey <span className="script-placeholder">[Name]</span>, this is <span className="script-placeholder">[Your Name]</span> — quick call, I promise I'll be brief.{' '}
            We work with <span className="script-highlight">HVAC and plumbing companies</span> who are struggling to keep their schedule full during slow months.{' '}
            Does that sound familiar?"
          </>
        ),
      },
      {
        title: 'Bridge',
        content: (
          <>
            "Most of our clients were spending hours doing their own outreach — cold calls, flyers, the lot — with zero consistency.{' '}
            We built a system that delivers <span className="script-highlight">5 to 15 qualified jobs booked per week</span>, completely on autopilot.{' '}
            We handle the lead gen, qualification, and appointment setting. You just show up."
          </>
        ),
      },
      {
        title: 'Close',
        content: (
          <>
            "Would it make sense to jump on a <span className="script-highlight">15-minute call</span> this week? I can show you exactly how it works for businesses like yours.{' '}
            Does <span className="script-placeholder">Thursday or Friday</span> work better for you?"
          </>
        ),
      },
    ],
    objections: [
      {
        q: '"I\'m too busy right now."',
        a: 'Totally get it — that\'s exactly why we built this. To take the busy work off your plate. The call is only 15 minutes. Would Thursday at 9am or Friday at 2pm work?',
      },
      {
        q: '"We\'re not interested."',
        a: 'Fair enough. Can I ask — is it the timing, or is keeping the schedule full just not a pain point right now?',
      },
      {
        q: '"We already have enough leads."',
        a: 'That\'s great to hear. How are you getting them? We typically work alongside what\'s already working to fill any seasonal gaps.',
      },
      {
        q: '"How much does it cost?"',
        a: 'Pricing depends on your market and what you\'re looking to hit — that\'s exactly what the 15-minute call covers. What I can say is that clients typically see ROI within the first two weeks.',
      },
      {
        q: '"Send me some information."',
        a: 'Absolutely — what\'s the best email? And while I\'ve got you, is there a specific challenge you\'re looking to solve? That way I can send you the most relevant stuff.',
      },
    ],
  },
  {
    id: 'b',
    label: 'Variant B',
    sublabel: 'Curiosity Hook',
    color: 'var(--cyan)',
    badge: null,
    sections: [
      {
        title: 'Open',
        content: (
          <>
            "Hey <span className="script-placeholder">[Name]</span>, quick question — if I could show you exactly how your competitors are{' '}
            <span className="script-highlight">booking 20+ jobs per month</span> without doing any cold calling themselves,{' '}
            would that be worth 15 minutes of your time?"
          </>
        ),
      },
      {
        title: 'Bridge',
        content: (
          <>
            "We've helped <span className="script-highlight">HVAC and plumbing businesses</span> implement a done-for-you lead gen system that targets{' '}
            homeowners <span className="script-highlight">actively searching</span> for your services right now.{' '}
            The key difference is we pre-qualify every lead before it hits your inbox — no tire kickers."
          </>
        ),
      },
      {
        title: 'Close',
        content: (
          <>
            "I have time <span className="script-placeholder">Tuesday or Wednesday</span> — which works better?{' '}
            Even if it's not a fit, you'll leave with a clear picture of what's working for top operators in your space right now."
          </>
        ),
      },
    ],
    objections: [
      {
        q: '"How did you get my number?"',
        a: 'I found you through Google Maps — you\'ve got a solid operation, that\'s why I reached out. I focus on businesses with strong reviews because the system works best when there\'s already a reputation to back it up.',
      },
      {
        q: '"We tried lead gen before and it didn\'t work."',
        a: 'What happened — was it quality, volume, or something else? Most people we talk to tried broad pay-per-click or bought a list. What we do is fundamentally different. I can show you exactly how in 15 minutes.',
      },
      {
        q: '"I handle my own marketing."',
        a: 'That\'s impressive — most owners I talk to are too swamped for that. Are you happy with where the volume is, or is there a target you\'re trying to hit?',
      },
      {
        q: '"We\'re fully booked."',
        a: 'That\'s the best problem to have. Are you thinking about expanding, or hiring another crew anytime soon? A lot of our clients used this to justify the investment in growth.',
      },
    ],
  },
  {
    id: 'c',
    label: 'Variant C',
    sublabel: 'Direct ROI',
    color: 'var(--green)',
    badge: null,
    sections: [
      {
        title: 'Open',
        content: (
          <>
            "Hi <span className="script-placeholder">[Name]</span>, I'll get straight to the point.{' '}
            We help HVAC businesses add <span className="script-highlight">$15,000 to $30,000 in revenue per month</span>{' '}
            by booking more qualified jobs without extra ad spend. Is that relevant to where you're at right now?"
          </>
        ),
      },
      {
        title: 'Bridge',
        content: (
          <>
            "Here's how it works: we run <span className="script-highlight">hyper-targeted outreach</span> to homeowners in your service area{' '}
            who are actively looking for HVAC services. We handle qualification and appointment setting.{' '}
            Our clients average <span className="script-highlight">8 to 12 new jobs</span> in the first 30 days."
          </>
        ),
      },
      {
        title: 'Close',
        content: (
          <>
            "Are you currently <span className="script-highlight">looking to grow revenue</span>, or are you at capacity for the next few months?{' '}
            Either answer is fine — I just want to make sure it makes sense for me to walk you through the numbers."
          </>
        ),
      },
    ],
    objections: [
      {
        q: '"Those numbers sound too good."',
        a: 'Completely fair. I\'d rather show you than tell you — that\'s the whole point of the 15-minute call. We\'ll look at your market, your average job value, and I\'ll give you a realistic projection. No pitch if the numbers don\'t stack up.',
      },
      {
        q: '"What\'s the catch?"',
        a: 'No long-term contracts, no setup fees we hide in the small print. We work on a monthly retainer, and if you\'re not getting results in 30 days, we give you the next month free. That\'s the deal.',
      },
      {
        q: '"I need to talk to my wife/partner first."',
        a: 'That makes total sense for a business decision. Would it help if I sent over a one-page breakdown you could both look at? And is there a better time to loop them into a call together?',
      },
      {
        q: '"We just signed with someone else."',
        a: 'No worries at all. Out of curiosity, what made you go with them? I\'m always trying to understand what matters most to business owners. No agenda — happy to just leave you my number if things don\'t work out.',
      },
    ],
  },
];

function CopyButton({ getText }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(getText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--green)" strokeWidth="2">
            <path d="M2 8l4 4 8-8"/>
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="4" y="4" width="9" height="11" rx="1"/>
            <path d="M3 12H2a1 1 0 01-1-1V2a1 1 0 011-1h9a1 1 0 011 1v1"/>
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

function ScriptSection({ title, content, accentColor }) {
  const getPlainText = () => {
    const div = document.createElement('div');
    div.innerHTML = content.toString();
    return div.textContent || '';
  };

  return (
    <div className="script-section">
      <div className="script-section-header" style={{ cursor: 'default' }}>
        <span className="script-section-title" style={{ color: accentColor }}>{title}</span>
        <CopyButton getText={() => {
          const tmp = document.createElement('div');
          // We'll just get the text content rendered in this section
          return tmp.textContent || title;
        }} />
      </div>
      <div className="script-section-body">{content}</div>
    </div>
  );
}

function ObjectionSection({ objections }) {
  const [open, setOpen] = useState(new Set());

  const toggle = (i) => {
    setOpen(prev => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  };

  return (
    <div className="script-section">
      <div className="script-section-header" style={{ cursor: 'default' }}>
        <span className="script-section-title" style={{ color: 'var(--yellow)' }}>Objection Handles</span>
        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{objections.length} objections</span>
      </div>
      {objections.map((obj, i) => (
        <div key={i} className="objection-item">
          <div className="objection-q" onClick={() => toggle(i)}>
            <span>{obj.q}</span>
            <svg
              width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ transform: open.has(i) ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
            >
              <path d="M3 6l5 5 5-5"/>
            </svg>
          </div>
          {open.has(i) && (
            <div className="objection-a animate-in">{obj.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function getScriptPlainText(script) {
  const parts = [];
  for (const s of script.sections) {
    parts.push(`=== ${s.title.toUpperCase()} ===`);
    // Strip JSX to text roughly
    parts.push(typeof s.content === 'string' ? s.content : '[See script]');
    parts.push('');
  }
  parts.push('=== OBJECTION HANDLES ===');
  for (const o of script.objections) {
    parts.push(`Q: ${o.q}`);
    parts.push(`A: ${o.a}`);
    parts.push('');
  }
  return parts.join('\n');
}

export default function Scripts() {
  const [active, setActive] = useState('a');
  const script = SCRIPTS.find(s => s.id === active);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Call Scripts</div>
          <div className="page-sub">Three proven variants — pick your style and go</div>
        </div>
        <CopyButton getText={() => getScriptPlainText(script)} />
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '24px', maxWidth: '480px' }}>
        {SCRIPTS.map((s) => (
          <div
            key={s.id}
            className={`tab ${active === s.id ? 'active' : ''}`}
            onClick={() => setActive(s.id)}
            style={active === s.id ? { borderColor: s.color, color: s.color } : {}}
          >
            <div style={{ fontWeight: '600' }}>{s.label}</div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>{s.sublabel}</div>
          </div>
        ))}
      </div>

      {/* Active script header */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{
          width: '4px',
          height: '40px',
          background: script.color,
          borderRadius: '99px',
          boxShadow: `0 0 12px ${script.color}`,
        }} />
        <div>
          <div style={{ fontWeight: '700', fontSize: '16px', color: script.color }}>{script.label}</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{script.sublabel} approach</div>
        </div>
        {script.badge && (
          <span style={{
            marginLeft: '8px',
            fontSize: '10px',
            fontWeight: '700',
            padding: '3px 8px',
            background: `${script.color}20`,
            color: script.color,
            border: `1px solid ${script.color}40`,
            borderRadius: '99px',
            letterSpacing: '0.5px',
          }}>
            {script.badge}
          </span>
        )}
      </div>

      {/* Script sections */}
      <div className="animate-in">
        {script.sections.map((section) => (
          <ScriptSection
            key={section.title}
            title={section.title}
            content={section.content}
            accentColor={script.color}
          />
        ))}
        <ObjectionSection objections={script.objections} />
      </div>

      {/* Tips */}
      <div className="card" style={{ marginTop: '20px', borderColor: 'rgba(108,99,255,0.2)', background: 'rgba(108,99,255,0.04)' }}>
        <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '10px', color: 'var(--accent)' }}>
          ⚡ Quick Tips
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            'Smile when you speak — it comes through in your voice.',
            'Don\'t read the script verbatim. Know it well enough to have a natural conversation.',
            'Silence is your friend. After asking a question, wait — resist the urge to fill the gap.',
            'Aim for 3 calls per hour. Quality over speed.',
            'Log every call immediately — even voicemails. The data adds up.',
          ].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-2)' }}>
              <span style={{ color: 'var(--accent)', flexShrink: 0 }}>→</span>
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
