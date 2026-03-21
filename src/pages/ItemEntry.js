import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { calculatePrice, formatPrice } from '../utils/pricing';
import { generateId, formatInvoiceNumber } from '../utils/helpers';
import {
  getCustomers,
  getInvoice,
  saveInvoice,
  getNextInvoiceNumber,
} from '../utils/storage';
import './ItemEntry.css';

export default function ItemEntry() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const customerId = params.get('customerId');
  const invoiceId = params.get('invoiceId'); // for editing existing invoice

  const [customer, setCustomer] = useState(null);
  const [existingInvoice, setExistingInvoice] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [form, setForm] = useState({
    length: '',
    width: '',
    height: '',
    quantity: '1',
    description: '',
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const galleryRef = React.useRef(null);
  const videoRef = React.useRef(null);
  const streamRef = React.useRef(null);

  const openCamera = async () => {
    setShowPhotoMenu(false);
    setCameraError(null);
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError('Unable to access camera. Please check permissions.');
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setForm((prev) => ({ ...prev, photo: dataUrl }));
    setPhotoPreview(dataUrl);
    closeCamera();
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (invoiceId) {
      const inv = getInvoice(invoiceId);
      if (inv) {
        setExistingInvoice(inv);
        const cust = getCustomers().find((c) => c.id === inv.customerId);
        setCustomer(cust);
      }
    } else if (customerId) {
      const cust = getCustomers().find((c) => c.id === customerId);
      setCustomer(cust);
    }
  }, [customerId, invoiceId]);

  const dims = {
    length: parseFloat(form.length) || 0,
    width: parseFloat(form.width) || 0,
    height: parseFloat(form.height) || 0,
  };
  const qty = parseInt(form.quantity) || 1;
  const unitPrice =
    dims.length > 0 && dims.width > 0 && dims.height > 0
      ? calculatePrice(dims.length, dims.width, dims.height)
      : 0;
  const lineTotal = unitPrice * qty;

  const runningTotal = lineItems.reduce(
    (sum, item) => sum + item.calculatedPrice * item.quantity,
    0
  );

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, photo: reader.result }));
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const addItem = () => {
    if (unitPrice === 0 || qty < 1) return;

    const item = {
      id: generateId(),
      dimensions: { length: dims.length, width: dims.width, height: dims.height },
      quantity: qty,
      calculatedPrice: unitPrice,
      photo: form.photo || null,
      description: form.description.trim() || null,
    };

    setLineItems((prev) => [...prev, item]);
    setForm({ length: '', width: '', height: '', quantity: '1', description: '', photo: null });
    setPhotoPreview(null);
  };

  const generateInvoice = () => {
    if (lineItems.length === 0) return;

    if (existingInvoice) {
      // Adding items to existing invoice
      const originalItemCount = existingInvoice.lineItems.reduce(
        (sum, li) => sum + li.quantity,
        0
      );
      const addedItemCount = lineItems.reduce((sum, li) => sum + li.quantity, 0);
      const updatedInvoice = {
        ...existingInvoice,
        lineItems: [...existingInvoice.lineItems, ...lineItems],
        total:
          existingInvoice.total +
          lineItems.reduce((sum, li) => sum + li.calculatedPrice * li.quantity, 0),
        originalItemCount,
        addedItemCount: (existingInvoice.addedItemCount || 0) + addedItemCount,
        lastEditedAt: new Date().toISOString(),
      };
      saveInvoice(updatedInvoice);
      navigate(`/invoice/${existingInvoice.id}`, { replace: true });
    } else {
      // New invoice
      const totalItemCount = lineItems.reduce((sum, li) => sum + li.quantity, 0);
      const invoice = {
        id: generateId(),
        invoiceNumber: getNextInvoiceNumber(),
        customerId: customer.id,
        customerName: customer.fullName,
        customerEmail: customer.email,
        customerAddress: customer.address,
        customerPhone: customer.phone,
        lineItems,
        total: lineItems.reduce((sum, li) => sum + li.calculatedPrice * li.quantity, 0),
        itemCount: totalItemCount,
        originalItemCount: totalItemCount,
        addedItemCount: 0,
        createdAt: new Date().toISOString(),
        status: 'completed',
      };
      saveInvoice(invoice);
      navigate(`/invoice/${invoice.id}`, { replace: true });
    }
  };

  if (!customer) {
    return (
      <div className="item-entry-page">
        <p>Customer not found.</p>
      </div>
    );
  }

  return (
    <div className="item-entry-page">
      <div className="customer-banner">
        <span className="banner-label">
          {existingInvoice ? `Adding to Invoice #${formatInvoiceNumber(existingInvoice.invoiceNumber, existingInvoice.originalItemCount, existingInvoice.addedItemCount)}` : 'Pickup for'}
        </span>
        <span className="banner-name">{customer.fullName}</span>
      </div>

      <div className="entry-section">
        <h3>Item Dimensions (inches)</h3>
        <div className="dims-row">
          <div className="dim-input">
            <label>Length</label>
            <input
              type="number"
              inputMode="decimal"
              value={form.length}
              onChange={(e) => setForm((p) => ({ ...p, length: e.target.value }))}
              placeholder="0"
            />
          </div>
          <span className="dim-x">×</span>
          <div className="dim-input">
            <label>Width</label>
            <input
              type="number"
              inputMode="decimal"
              value={form.width}
              onChange={(e) => setForm((p) => ({ ...p, width: e.target.value }))}
              placeholder="0"
            />
          </div>
          <span className="dim-x">×</span>
          <div className="dim-input">
            <label>Height</label>
            <input
              type="number"
              inputMode="decimal"
              value={form.height}
              onChange={(e) => setForm((p) => ({ ...p, height: e.target.value }))}
              placeholder="0"
            />
          </div>
        </div>

        <div className="qty-row">
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="e.g., Box, Pallet"
            />
          </div>
        </div>

        <div className="photo-row">
          <button
            type="button"
            className="photo-btn"
            onClick={() => setShowPhotoMenu(!showPhotoMenu)}
          >
            📷 {photoPreview ? 'Change Photo' : 'Add Photo'}
          </button>
          {photoPreview && <img src={photoPreview} alt="Item" className="photo-thumb" />}
          <input ref={galleryRef} type="file" accept="image/*" onChange={handlePhoto} hidden />
        </div>
        {cameraError && <div className="camera-error">{cameraError}</div>}
        {showPhotoMenu && (
          <div className="photo-menu">
            <button
              type="button"
              className="photo-menu-option"
              onClick={openCamera}
            >
              📸 Take Photo
            </button>
            <button
              type="button"
              className="photo-menu-option"
              onClick={() => { galleryRef.current.click(); setShowPhotoMenu(false); }}
            >
              🖼️ Choose from Gallery
            </button>
            <button
              type="button"
              className="photo-menu-cancel"
              onClick={() => setShowPhotoMenu(false)}
            >
              Cancel
            </button>
          </div>
        )}
        {showCamera && (
          <div className="camera-overlay">
            <div className="camera-viewfinder">
              <video ref={videoRef} autoPlay playsInline className="camera-video" />
              <div className="camera-controls">
                <button type="button" className="camera-cancel-btn" onClick={closeCamera}>
                  Cancel
                </button>
                <button type="button" className="camera-capture-btn" onClick={capturePhoto}>
                  <span className="capture-circle" />
                </button>
                <div className="camera-spacer" />
              </div>
            </div>
          </div>
        )}

        {unitPrice > 0 && (
          <div className="price-preview">
            <div className="price-line">
              <span>Unit Price:</span>
              <span>{formatPrice(unitPrice)}</span>
            </div>
            {qty > 1 && (
              <div className="price-line total">
                <span>Line Total ({qty} items):</span>
                <span>{formatPrice(lineTotal)}</span>
              </div>
            )}
          </div>
        )}

        <button
          className="add-item-btn"
          onClick={addItem}
          disabled={unitPrice === 0}
        >
          + Add Item
        </button>
      </div>

      {lineItems.length > 0 && (
        <div className="added-items">
          <h3>Added Items ({lineItems.length})</h3>
          {lineItems.map((item, idx) => (
            <div key={item.id} className="added-item-card">
              <div className="item-row">
                <span className="item-dims">
                  {item.dimensions.length}×{item.dimensions.width}×{item.dimensions.height}"
                </span>
                <span className="item-qty">Qty: {item.quantity}</span>
                <span className="item-price">
                  {formatPrice(item.calculatedPrice * item.quantity)}
                </span>
              </div>
              {item.description && (
                <div className="item-desc">{item.description}</div>
              )}
            </div>
          ))}
          <div className="running-total">
            <span>Running Total:</span>
            <span>{formatPrice(runningTotal)}</span>
          </div>
          <button className="generate-btn" onClick={generateInvoice}>
            {existingInvoice ? 'Update Invoice' : 'Generate Invoice'}
          </button>
        </div>
      )}
    </div>
  );
}
