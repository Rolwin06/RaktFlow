import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useNetworkStore } from '@/store/networkStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { DEMO_CENTER, NETWORK_RADIUS_KM } from '@/app/constants';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { MapPin, Activity, ShieldCheck, Clock, Layers } from 'lucide-react';
import { formatTimeAgo } from '@/utils/date';

// Custom Map Marker Icons using SVG data URIs
const createMarkerIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 10px;
    ">🩸</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export const NetworkMapPage: React.FC = () => {
  const { bloodBanks, setCurrentBankId } = useNetworkStore();
  const { inventory } = useInventoryStore();

  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);

  const selectedBank = bloodBanks.find((b) => b.id === selectedBankId);
  const selectedInventory = inventory.filter((inv) => inv.bankId === selectedBankId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-surface-900">
              Interactive 50 km Network Map
            </h1>
            <span className="text-xs font-mono font-bold bg-surface-100 text-surface-800 border border-surface-200 px-2.5 py-0.5 rounded-full">
              Bangalore Regional Grid
            </span>
          </div>
          <p className="text-xs text-surface-500 mt-1">
            Visualizing 8 operational blood bank nodes, radius boundary, and real-time inventory confidence.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-mono bg-white p-2 rounded-lg border border-surface-200">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Fresh (&gt;85%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Aging</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Stale (&lt;60%)</span>
          </div>
        </div>
      </div>

      {/* Main Map + Side Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Leaflet Map */}
        <div className="lg:col-span-2 h-[560px] rounded-xl overflow-hidden border border-surface-200 shadow-xs relative">
          <MapContainer
            center={[DEMO_CENTER.latitude, DEMO_CENTER.longitude]}
            zoom={11}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* 50 km Coverage Circle */}
            <Circle
              center={[DEMO_CENTER.latitude, DEMO_CENTER.longitude]}
              radius={NETWORK_RADIUS_KM * 1000}
              pathOptions={{
                color: '#DC2626',
                fillColor: '#FEE2E2',
                fillOpacity: 0.08,
                dashArray: '6, 8',
                weight: 1.5,
              }}
            />

            {/* Bank Markers */}
            {bloodBanks.map((bank) => {
              const markerColor =
                bank.freshnessStatus === 'fresh'
                  ? '#10B981'
                  : bank.freshnessStatus === 'aging'
                  ? '#F59E0B'
                  : '#EF4444';

              return (
                <Marker
                  key={bank.id}
                  position={[bank.latitude, bank.longitude]}
                  icon={createMarkerIcon(markerColor)}
                  eventHandlers={{
                    click: () => {
                      setSelectedBankId(bank.id);
                    },
                  }}
                >
                  <Popup>
                    <div className="font-sans text-xs p-1">
                      <strong className="block text-sm font-bold text-surface-900">{bank.name}</strong>
                      <span className="text-surface-500 block mt-0.5">{bank.address}</span>
                      <div className="mt-2 pt-2 border-t border-surface-200 flex items-center justify-between font-mono">
                        <span>Trust Score:</span>
                        <strong className="text-surface-900">{bank.confidenceScore}%</strong>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Right Col: Selected Bank Inspection Panel */}
        <div>
          {selectedBank ? (
            <Card className="h-full bg-white shadow-xs">
              <CardHeader className="bg-surface-50/70 border-b border-surface-100">
                <div>
                  <span className="text-[10px] font-mono uppercase text-surface-500 font-bold block">
                    FACILITY TELEMETRY
                  </span>
                  <CardTitle className="text-base font-bold text-surface-900 mt-0.5">
                    {selectedBank.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-1.5 text-xs text-surface-600">
                  <div><strong>Address:</strong> {selectedBank.address}</div>
                  <div><strong>Hours:</strong> {selectedBank.operatingHours}</div>
                  <div><strong>Status:</strong> <span className="font-semibold text-emerald-700 capitalize">{selectedBank.status}</span></div>
                  <div><strong>Last Audit:</strong> {formatTimeAgo(selectedBank.lastConfirmedAt)}</div>
                  <div><strong>Confidence:</strong> {selectedBank.confidenceScore}% trust score</div>
                </div>

                <div className="pt-3 border-t border-surface-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-surface-700 mb-2 font-mono">
                    Key Inventory Reserves
                  </h4>
                  <div className="space-y-1.5 text-xs font-mono">
                    {selectedInventory.slice(0, 5).map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between p-2 rounded bg-surface-50 border border-surface-200/80"
                      >
                        <span className="font-bold text-surface-800">{inv.bloodGroup} {inv.component}</span>
                        <div className="text-right">
                          <span className="font-bold text-surface-900">{inv.availableUnits} avail</span>
                          <span className="text-emerald-700 block text-[10px]">{inv.transferableUnits} transferable</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center p-6 text-center text-xs text-surface-500 bg-surface-50 border-dashed">
              <div>
                <MapPin className="w-8 h-8 text-surface-400 mx-auto mb-2" />
                <p className="font-semibold text-surface-700">Select any blood bank pin</p>
                <p className="mt-1">Click a marker on the map to inspect real-time transferable stocks and trust scores.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
