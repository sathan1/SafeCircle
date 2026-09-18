import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Eye, UserCheck, Check, X, MapPin, Navigation, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { contactService } from '../../services/contactService';
import { liveSyncService } from '../../services/liveSyncService';
import Card from '../common/Card';
import StatusBadge from '../common/StatusBadge';

export default function WardsEscortCard() {
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedWardView, setSelectedWardView] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [invs, wardList] = await Promise.all([
        contactService.getPendingInvitations().catch(() => []),
        contactService.getWards().catch(() => [])
      ]);
      setPendingInvitations(invs);
      setWards(wardList);
    } catch (e) {
      console.warn('Failed to fetch wards/invitations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to real-time events from WebSocket Gateway
    const unsubscribe = liveSyncService.subscribe((eventType, payload) => {
      if (['INVITATION_RECEIVED', 'INVITATION_RESPONDED', 'SAFETY_STATE_CHANGED', 'JOURNEY_STARTED', 'JOURNEY_COMPLETED', 'LOCATION_UPDATE'].includes(eventType)) {
        fetchData();
        // If viewing this specific ward, refresh the view
        if (selectedWardView && payload && payload.journeyId === selectedWardView.journey?.id) {
          fetchWardView(payload.journeyId, selectedWardView.contact?.id);
        }
      }
    });

    // Periodic short polling fallback (every 5 seconds)
    const interval = setInterval(fetchData, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [selectedWardView]);

  const handleRespond = async (invitationId, status) => {
    setActionLoading(invitationId);
    try {
      await contactService.respondToInvitation(invitationId, status);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to respond to invitation');
    } finally {
      setActionLoading(null);
    }
  };

  const fetchWardView = async (journeyId, contactId) => {
    setViewLoading(true);
    try {
      const view = await contactService.getWardJourneyView(journeyId, contactId);
      setSelectedWardView(view);
    } catch (err) {
      console.warn('Failed to fetch ward view:', err);
    } finally {
      setViewLoading(false);
    }
  };

  if (loading && wards.length === 0 && pendingInvitations.length === 0) {
    return null;
  }

  // If no invitations and no wards, don't clutter Person's dashboard
  if (pendingInvitations.length === 0 && wards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* 1. Pending Safety Circle Invitations */}
      {pendingInvitations.length > 0 && (
        <Card className="border-l-4 border-l-rose-500 bg-rose-50/40">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm font-bold text-stone-900">Safety Circle Invitation Received</h3>
          </div>
          <div className="space-y-3">
            {pendingInvitations.map((inv) => (
              <div key={inv.id} className="p-3 bg-white rounded-2xl border border-rose-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-stone-900 text-sm">{inv.fromUserName} ({inv.fromUserEmail})</div>
                  <div className="text-xs text-stone-500">Wants to add you as trusted contact ({inv.relationship}) with custom progressive safety permissions.</div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    disabled={actionLoading === inv.id}
                    onClick={() => handleRespond(inv.id, 'ACCEPTED')}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept</span>
                  </button>
                  <button
                    disabled={actionLoading === inv.id}
                    onClick={() => handleRespond(inv.id, 'REJECTED')}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 text-stone-700 font-semibold text-xs hover:bg-stone-200 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 2. People Who Trust You (Accepted Wards) */}
      {wards.length > 0 && (
        <Card className="border border-stone-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-rose-600" />
              <h3 className="text-base font-bold text-stone-900">People Who Trust You</h3>
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Guardian Escort
              </span>
            </div>
            <button onClick={fetchData} className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {wards.map((ward) => {
              const hasActive = Boolean(ward.activeJourney);
              const journeyState = ward.activeJourney?.currentState || 'NORMAL';

              return (
                <div key={ward.invitationId} className="p-4 rounded-2xl bg-[#fcf8f8] border border-stone-200/80 flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-extrabold text-stone-900 text-sm">{ward.wardName}</div>
                      <div className="text-xs text-stone-500">{ward.relationship} • {ward.wardEmail}</div>
                    </div>
                    {hasActive ? (
                      <StatusBadge state={journeyState} size="sm" />
                    ) : (
                      <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                        No Active Journey
                      </span>
                    )}
                  </div>

                  {hasActive && ward.activeJourney ? (
                    <div className="p-3 bg-white rounded-xl border border-stone-200/60 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-stone-700 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Navigation className="w-3.5 h-3.5 text-rose-600" />
                          <span>To: {ward.activeJourney.destination?.name || 'Destination'}</span>
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(ward.activeJourney.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500">
                        Safety Status: <strong className="text-stone-800">{journeyState}</strong>
                      </div>
                      <button
                        onClick={() => fetchWardView(ward.activeJourney.id, ward.contactId)}
                        className="w-full mt-2 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Permitted Information</span>
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-stone-500 italic">
                      When {ward.wardName} starts a Safe Journey, live progressive information will appear here according to their privacy policy.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Modal / Panel for Permitted Ward View */}
          {selectedWardView && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">Guardian Inspection</span>
                    <h3 className="text-base font-extrabold text-stone-900">
                      Protected Journey: {selectedWardView.contact?.name || 'User'}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedWardView(null)}
                    className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* State Banner */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-stone-500 font-medium">Current Safety State:</div>
                    <div className="font-extrabold text-stone-900 text-sm">{selectedWardView.journey?.safetyState}</div>
                  </div>
                  <StatusBadge state={selectedWardView.journey?.safetyState} size="sm" />
                </div>

                {/* Disclosed Information Categories */}
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-stone-800">Information Authorized For You:</div>
                  {Object.entries(selectedWardView.visibilityMatrix || {}).map(([type, meta]) => (
                    <div key={type} className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${meta.allowed ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' : 'bg-stone-50 border-stone-200/70 text-stone-500'}`}>
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span>{meta.name || type}</span>
                          {meta.allowed ? (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">ALLOWED</span>
                          ) : (
                            <span className="text-[10px] bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded font-bold">RESTRICTED</span>
                          )}
                        </div>
                        <div className="text-[11px] mt-0.5 opacity-80">{meta.explanation}</div>
                      </div>
                      {meta.allowed && selectedWardView.disclosed[type]?.data && (
                        <div className="text-[11px] font-mono bg-white p-2 rounded-lg border border-emerald-200 max-w-[200px] break-words">
                          {type === 'APPROXIMATE_LOCATION' && (
                            <div>📍 {selectedWardView.disclosed[type].data.approximateArea}</div>
                          )}
                          {type === 'LIVE_LOCATION' && (
                            <div>🎯 Lat: {selectedWardView.disclosed[type].data.latitude}, Lng: {selectedWardView.disclosed[type].data.longitude}</div>
                          )}
                          {type === 'JOURNEY_STATUS' && (
                            <div>Status: {selectedWardView.disclosed[type].data.status}</div>
                          )}
                          {type === 'EMERGENCY_STATUS' && (
                            <div>Alert: {selectedWardView.disclosed[type].data.safetyState} ({selectedWardView.disclosed[type].data.escalationLevel})</div>
                          )}
                          {type === 'JOURNEY_DETAILS' && (
                            <div>Dest: {selectedWardView.disclosed[type].data.destination}</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => setSelectedWardView(null)}
                    className="w-full py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    Close View
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
