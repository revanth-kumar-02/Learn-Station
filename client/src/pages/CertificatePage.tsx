import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { progressService } from '../services/userService';
import PageTransition from '../components/layout/PageTransition';
import Loader from '../components/common/Loader';

export default function CertificatePage() {
  const { certId } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const printRef = useRef(null);

  useEffect(() => {
    const fetchCert = async () => {
      try {
        setLoading(true);
        const result = await progressService.getCertificate(certId);
        setCert(result.certificate);
      } catch (err) {
        console.error('Error loading certificate:', err);
        setError(err.response?.status === 404 ? 'Certificate not found.' : 'Failed to load certificate.');
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [certId]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Learn Station Certificate — ${cert?.track?.name}`,
          text: `I completed the ${cert?.track?.name} track on Learn Station! 🎓`,
          url,
        });
      } catch {
        // Share cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert('Certificate link copied to clipboard!');
    }
  };

  if (loading) return <Loader fullPage />;

  if (error) {
    return (
      <PageTransition>
        <div className="cert-error">
          <div className="container">
            <div className="cert-error__card">
              <span>📜</span>
              <h2>{error}</h2>
              <p>The certificate <strong>{certId}</strong> could not be verified.</p>
              <Link to="/" className="btn btn--primary btn--md">Go Home</Link>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  const completionDate = new Date(cert.completion_date || cert.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <PageTransition>
      <div className="certificate-page">
        <style>{`
          .cert-header-nav {
            max-width: 800px;
            margin: 0 auto 20px;
            display: flex;
            justify-content: flex-start;
            padding: 0 20px;
          }
          .cert-back-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: var(--text-secondary);
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: color 0.2s;
          }
          .cert-back-link:hover {
            color: var(--text-primary) !important;
            text-decoration: underline !important;
          }
          @media print {
            .cert-header-nav,
            .cert-actions,
            .cert-verification,
            .navbar,
            .layout-sidebar {
              display: none !important;
            }
          }
        `}</style>
        <div className="container">
          {/* Top navigation */}
          <div className="cert-header-nav">
            <Link to="/" className="cert-back-link" id="cert-back-dashboard-btn">
              ← Back to Dashboard
            </Link>
          </div>

          {/* Action buttons */}
          <motion.div
            className="cert-actions"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '32px'
            }}
          >
            <button onClick={handlePrint} className="btn btn--secondary btn--md" id="cert-download-btn">
              📥 Download PDF
            </button>
            <button onClick={handleShare} className="btn btn--primary btn--md" id="cert-share-btn">
              ✨ Share Achievement
            </button>
            <Link to="/" className="btn btn--secondary btn--md" id="cert-home-btn">
              🏠 Return Home
            </Link>
            <Link to="/tracks" className="btn btn--secondary btn--md" id="cert-explore-btn">
              🚀 Explore More Tracks
            </Link>
          </motion.div>

          {/* Certificate Document */}
          <motion.div
            ref={printRef}
            className="certificate-document"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="cert-doc__header">
              <div className="cert-doc__logo">⚡ Learn Station</div>
              <div className="cert-doc__divider" />
              <h1 className="cert-doc__title">Certificate of Completion</h1>
            </div>

            {/* Body */}
            <div className="cert-doc__body">
              <p className="cert-doc__awarded-text">This certifies that</p>
              <h2 className="cert-doc__recipient">{cert.user?.name || 'Learner'}</h2>
              <p className="cert-doc__completion-text">has successfully completed the</p>
              <div className="cert-doc__track-badge" style={{ color: cert.track?.color || 'var(--accent-blue)' }}>
                <span>{cert.track?.icon || '📚'}</span>
                <h3 className="cert-doc__track-name">{cert.track?.name || 'Learning Track'}</h3>
              </div>
              <p className="cert-doc__desc">
                demonstrating dedication, persistence, and mastery of core concepts through lessons, quizzes, challenges, and a capstone project.
              </p>
            </div>

            {/* Footer */}
            <div className="cert-doc__footer">
              <div className="cert-doc__footer-left">
                <div className="cert-doc__signature">Learn Station</div>
                <div className="cert-doc__sig-label">Platform Authority</div>
              </div>
              <div className="cert-doc__footer-center">
                <div className="cert-doc__seal">🎖️</div>
                <div className="cert-doc__xp">+{cert.xp_earned || 500} XP Earned</div>
              </div>
              <div className="cert-doc__footer-right">
                <div className="cert-doc__date">{completionDate}</div>
                <div className="cert-doc__id">ID: {cert.certificate_id}</div>
              </div>
            </div>
          </motion.div>

          {/* Verification info */}
          <motion.div
            className="cert-verification"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p>✅ This certificate is verified and issued by Learn Station</p>
            <p>Certificate ID: <strong>{cert.certificate_id}</strong></p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
