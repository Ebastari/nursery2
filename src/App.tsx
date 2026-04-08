import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './layout/Layout';
import { DashboardScreen } from './screens/DashboardScreen';
import { QuickInputScreen } from './screens/QuickInputScreen';
import { StockScreen } from './screens/StockScreen';
import { DistributionScreen } from './screens/DistributionScreen';
import { DocumentScreen } from './screens/DocumentScreen';
import { AlertScreen } from './screens/AlertScreen';
import { PerformanceScreen } from './screens/PerformanceScreen';
import { SuratJalanScreen } from './screens/SuratJalanScreen';
import { VerifyScreen } from './screens/VerifyScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardScreen />} />
          <Route path="/input" element={<QuickInputScreen />} />
          <Route path="/stock" element={<StockScreen />} />
          <Route path="/performance" element={<PerformanceScreen />} />
          <Route path="/distribution" element={<DistributionScreen />} />
          <Route path="/documents" element={<DocumentScreen />} />
          <Route path="/alerts" element={<AlertScreen />} />
          <Route path="/surat-jalan" element={<SuratJalanScreen />} />
          <Route path="/verify" element={<VerifyScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
