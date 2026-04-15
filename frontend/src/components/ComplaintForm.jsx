import { useEffect, useMemo, useRef, useState } from 'react';
import { analyzeImage, analyzeText, createComplaint } from '../services/api';
import { LocationMap } from './LocationMap';

function severityColor(severity) {
  switch (severity) {
    case 'HIGH':
      return 'var(--danger)';
    case 'MEDIUM':
      return 'var(--warning)';
    default:
      return 'var(--success)';
  }
}

export function ComplaintForm({ onComplaintCreated }) {
  const [imageFile, setImageFile] = useState(null);
  const [complaintText, setComplaintText] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [textAnalysis, setTextAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const imageRef = useRef(null);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview('');
      return undefined;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  useEffect(() => {
    if (navigator.geolocation && !latitude && !longitude) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(String(position.coords.latitude.toFixed(6)));
          setLongitude(String(position.coords.longitude.toFixed(6)));
        },
        () => {
          // Location entry remains optional if permissions are denied.
        },
      );
    }
  }, [latitude, longitude]);

  const boxes = analysis?.bounding_boxes || [];

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
    setAnalysis(null);
    setError('');
  };

  const handleAnalyze = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!complaintText.trim() && !imageFile) {
        throw new Error('Add an image or complaint text before analyzing.');
      }

      const trimmedText = complaintText.trim();
      let textResult = null;
      let imageResult = null;

      if (trimmedText) {
        textResult = await analyzeText(trimmedText);
        setTextAnalysis(textResult);
      }

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('complaint_text', trimmedText);
        if (latitude.trim()) {
          formData.append('latitude', latitude.trim());
        }
        if (longitude.trim()) {
          formData.append('longitude', longitude.trim());
        }
        imageResult = await analyzeImage(formData);
        setAnalysis(imageResult);
      } else {
        const complaintResponse = await createComplaint({
          complaint_text: trimmedText,
          severity: textResult?.urgency === 'urgent' ? 'MEDIUM' : 'LOW',
          waste_type: 'unknown',
          urgency: textResult?.urgency || 'normal',
          keywords: textResult?.keywords || [],
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
          image_path: null,
        });
        setAnalysis({
          severity: complaintResponse.severity,
          severity_score: complaintResponse.severity === 'HIGH' ? 0.9 : complaintResponse.severity === 'MEDIUM' ? 0.55 : 0.15,
          waste_type: complaintResponse.waste_type,
          bounding_boxes: [],
          confidence_scores: [],
          detected_labels: [],
          image_path: null,
        });
      }

      onComplaintCreated?.({
        complaintText,
        imageResult,
        textResult,
      });
    } catch (requestError) {
      setError(requestError.message || 'Unable to analyze complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleImageLoad = () => {
    if (imageRef.current) {
      setDisplaySize({
        width: imageRef.current.clientWidth,
        height: imageRef.current.clientHeight,
      });
    }
  };

  const overlayScale = useMemo(() => {
    if (!imageRef.current || !imageFile || !analysis || !boxes.length) {
      return { x: 1, y: 1 };
    }
    const naturalWidth = imageRef.current.naturalWidth || 1;
    const naturalHeight = imageRef.current.naturalHeight || 1;
    return {
      x: displaySize.width / naturalWidth,
      y: displaySize.height / naturalHeight,
    };
  }, [analysis, boxes.length, displaySize.height, displaySize.width, imageFile]);

  return (
    <section className="panel hero-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Citizen reporting</p>
          <h2>Submit a garbage complaint</h2>
        </div>
        <div className="badge">AI triage</div>
      </div>

      <form className="form-grid" onSubmit={handleAnalyze}>
        <label className="field">
          <span>Upload image</span>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>

        <label className="field field-wide">
          <span>Complaint text</span>
          <textarea
            rows="4"
            placeholder="Describe the garbage situation, how long it has been there, and any urgency cues."
            value={complaintText}
            onChange={(event) => setComplaintText(event.target.value)}
          />
        </label>

        <label className="field">
          <span>Latitude</span>
          <input value={latitude} onChange={(event) => setLatitude(event.target.value)} placeholder="e.g. 28.6139" />
        </label>

        <label className="field">
          <span>Longitude</span>
          <input value={longitude} onChange={(event) => setLongitude(event.target.value)} placeholder="e.g. 77.2090" />
        </label>

        <div className="field field-wide actions-row">
          <button className="button primary" type="submit" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze complaint'}
          </button>
          <div className="helper-text">Image analysis, text urgency detection, and complaint persistence happen together.</div>
        </div>
      </form>

      {error ? <div className="alert error">{error}</div> : null}

      <div className="results-grid">
        <div className="result-card image-card">
          <div className="result-title">Detection preview</div>
          {imagePreview ? (
            <div className="image-frame">
              <img ref={imageRef} src={imagePreview} alt="Garbage complaint preview" onLoad={handleImageLoad} />
              {analysis ? (
                <div className="bbox-layer">
                  {boxes.map((box, index) => (
                    <div
                      key={`${box.label}-${index}`}
                      className="bbox"
                      style={{
                        left: `${box.x1 * overlayScale.x}px`,
                        top: `${box.y1 * overlayScale.y}px`,
                        width: `${(box.x2 - box.x1) * overlayScale.x}px`,
                        height: `${(box.y2 - box.y1) * overlayScale.y}px`,
                      }}
                    >
                      <span>{box.label}</span>
                      <small>{Math.round(box.confidence * 100)}%</small>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="empty-state">Upload an image to display YOLO bounding boxes here.</div>
          )}
        </div>

        <div className="result-card stats-card">
          <div className="result-title">AI results</div>
          <div className="stat"><span>Severity</span><strong style={{ color: severityColor(analysis?.severity || 'LOW') }}>{analysis?.severity || 'LOW'}</strong></div>
          <div className="stat"><span>Severity score</span><strong>{analysis ? analysis.severity_score.toFixed(3) : '0.000'}</strong></div>
          <div className="stat"><span>Waste type</span><strong>{analysis?.waste_type || 'unknown'}</strong></div>
          <div className="stat"><span>Urgency</span><strong>{textAnalysis?.urgency || 'normal'}</strong></div>
          <div className="tag-list">
            {(analysis?.detected_labels || []).map((label) => <span key={label} className="tag">{label}</span>)}
            {(textAnalysis?.keywords || []).map((keyword) => <span key={keyword} className="tag muted">{keyword}</span>)}
          </div>
        </div>

        <div className="result-card map-card">
          <div className="result-title">Location</div>
          <div className="mini-map">
            <LocationMap latitude={latitude} longitude={longitude} />
          </div>
        </div>
      </div>
    </section>
  );
}
