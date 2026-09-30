import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import Typography from '@mui/material/Typography';
import { Gauge } from '@backstage/core-components';
import OpenInNew from '@mui/icons-material/OpenInNew';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import HighlightOff from '@mui/icons-material/HighlightOff';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import WbTwilight from '@mui/icons-material/WbTwilight';
import GppGoodOutlined from '@mui/icons-material/GppGoodOutlined';

const interleave = (arr: any, thing: any) => [].concat(...arr.map((n: any) => [n, thing])).slice(0, -1)

const getStatusColorSpan = (status: string) => {
  // theme palette colors adapt to light/dark themes
  let color;
  if (status === 'failed' || status === 'false') {
    color = 'error.main';
  } else if (status === 'passed' || status === 'true') {
    color = 'success.main';
  } else {
    color = 'text.secondary';
  }
  return <Box component="span" sx={{ color }}>{status}</Box>;
};

const badgeStyle = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 4, fontSize: 13, whiteSpace: 'nowrap' as const };
const iconStyle = { fontSize: 16 };

// policy evaluation badge (like Sysdig Secure); "accepted" means an exception made the result pass
const getPolicyEvaluation = (status: string) => {
  if (status === 'failed') {
    return <span style={{ ...badgeStyle, backgroundColor: '#5C2B2B', color: '#FFB4B4' }}><HighlightOff style={iconStyle} />Failed</span>;
  }
  if (status === 'passed' || status === 'accepted') {
    return <span style={{ ...badgeStyle, backgroundColor: '#1E4D3A', color: '#8FE3B8' }}><CheckCircleOutline style={iconStyle} />Passed</span>;
  }
  return <Box component="span" sx={{ color: 'text.secondary' }}>{status}</Box>;
};

// component lifecycle badge: EOL once past the end-of-life date, Active before it, nothing if unknown
const getLifecycle = (endOfLifeDate?: string) => {
  if (!endOfLifeDate) return null;
  const date = endOfLifeDate.slice(0, 10);
  if (new Date(endOfLifeDate) <= new Date()) {
    return (
      <Tooltip title={`End of life since ${date}`}>
        <span style={{ ...badgeStyle, backgroundColor: '#5C2B2B', color: '#FFB4B4' }}><WbTwilight style={iconStyle} />EOL</span>
      </Tooltip>
    );
  }
  return (
    <Tooltip title={`End of life on ${date}`}>
      <span style={{ ...badgeStyle, backgroundColor: '#1E4D3A', color: '#8FE3B8' }}><CheckCircleOutline style={iconStyle} />Active</span>
    </Tooltip>
  );
};

const getException = (status: string) => {
  if (status !== 'accepted') return null;
  return (
    <Tooltip title="Risk accepted: an exception applies to this result">
      <GppGoodOutlined style={{ fontSize: 20 }} />
    </Tooltip>
  );
};

// fixed text color so chips stay readable in both light and dark themes
const chipStyle = (backgroundColor: string) => ({ backgroundColor, color: 'black' });

const SEVERITIES = [
  { key: 'critical', label: 'Critical', bg: '#A13CC4', fg: 'white' },
  { key: 'high', label: 'High', bg: '#D32F2F', fg: 'white' },
  { key: 'medium', label: 'Medium', bg: '#F28C28', fg: 'black' },
  { key: 'low', label: 'Low', bg: '#F5C518', fg: 'black' },
  { key: 'negligible', label: 'Negligible', bg: '#9E9E9E', fg: 'black' },
];

const segmentStyle = { minWidth: 36, padding: '2px 6px', fontSize: 12, fontWeight: 600, textAlign: 'center' as const, whiteSpace: 'nowrap' as const };

// compact severity bar (like Sysdig Secure): counts only, severity name on hover, "-" for zero
// Sysdig Secure only shows critical, high and medium for in-use vulnerabilities
const IN_USE_SEVERITIES = ['critical', 'high', 'medium'];

function getChips(severities: any, keys: string[] = SEVERITIES.map(sev => sev.key)) {
  if (!severities) {
    return (
      <Tooltip title="No runtime usage data available">
        <span style={{ ...segmentStyle, display: 'inline-block', borderRadius: 4, backgroundColor: '#616161', color: 'white' }}>N/A</span>
      </Tooltip>
    );
  }
  return (
    <span style={{ display: 'inline-flex', borderRadius: 4, overflow: 'hidden' }}>
      {SEVERITIES.filter(sev => keys.includes(sev.key)).map(({ key, label, bg, fg }) => {
        const count = severities[key] ?? 0;
        return (
          <Tooltip key={key} title={`${label}: ${count}`}>
            <span style={{ ...segmentStyle, backgroundColor: count ? bg : '#616161', color: count ? fg : '#BDBDBD' }}>
              {count || '-'}
            </span>
          </Tooltip>
        );
      })}
    </span>
  );
}

// sort by most severe first: critical, then high, medium, low, negligible
const compareSeverities = (a: any, b: any) => {
  for (const { key } of SEVERITIES) {
    const diff = (a?.[key] ?? -1) - (b?.[key] ?? -1);
    if (diff !== 0) return diff;
  }
  return 0;
};

function getScope(scope: any) {
  const textScope = [];
  for (const key in scope) {
    if (Object.prototype.hasOwnProperty.call(scope, key)) {
      textScope.push(<p key={key}><b>{key}</b>{': '}{scope[key]}<br /></p>);
    }
  }
  return textScope;
}

function getDetails(scan: any) {
  return (
    <Tooltip
      title={
        <div>
          <Typography color="inherit">Result Details</Typography>
          {(() => {
            const details: any = [];
            if ("scope" in scan) details.push(...getScope(scan.scope));
            // if ("configuration" in scan) details.concat(getScope(scan.configuration))
            if ("labels" in scan) {
              details.push(
                <div key="labels">
                  <br />
                  <b>Labels</b>: <br /> {interleave(scan.labels, <br />)}
                </div>,
              );
            }
            if ("zones" in scan) {
              details.push(
                <div key="zones">
                  <br />
                  <b>Zones</b>: <br />{' '}
                  {interleave(
                    scan.zones.map((item: { name: any }) => item.name),
                    <br />,
                  )}
                </div>,
              );
            }
            return details;
          })()}
        </div>
      }
    >
      <IconButton aria-label="delete" size="large">
        <InfoIcon />
      </IconButton>
    </Tooltip>
  );
}

function truncate(str: string, n: number){
  return (str.length > n) ? `${str.slice(0, n-1)}...` : str;
};

function getFailed(failed: any) {
  const result: JSX.Element[] = [];
  for (const policy of failed.filter((f: { [x: string]: any; }) => !f.pass)) {
    result.push(<Chip size="small" label={truncate(policy.name,25)} style={chipStyle('red')} key={policy.name} />);
  }
  return result;
}

function getPassed(passed: any) {
  const result: JSX.Element[] = [];
  for (const policy of passed.filter((f: { [x: string]: any; }) => f.pass)) {
    result.push(<Chip size="small" label={truncate(policy.name,25)} style={chipStyle('green')} key={policy.name} />);
  }
  return result;
}

function getGauge(passPercentage: number) {
  return (
    <div style={{width:250}}>
      <Gauge
        value={passPercentage/100}
      />
    </div>
  );
}

function getResourceName(name: string, type: string, platform: string, origin: string) {
  return (
    <div>
      <h2>{name}</h2>
      <Chip size="small" label={<p><b>Resource Type = </b>{type}</p>} />
      <Chip size="small" label={<p><b>Platform = </b>{platform}</p>} />
      <Chip size="small" label={<p><b>Origin = </b>{origin}</p>} />
    </div>
  );
}

// Convert from timestamp to datetime
function getDate(timestamp: number): string {
  const date = new Date(timestamp);
  // render date as sortable string alphabetically
  const split_strings = date.toISOString().split('T');
  const ymd = split_strings[0];
  const time = split_strings[1].split('.')[0];
  return `${ymd} ${time}`;
}

function getTitleWithBacklink(title: string, backlink: string) {
  return (
    <div style={{display:"flex"}}>
      <a href={backlink} target="_blank" rel="noopener noreferrer">{title}</a>
      <div style={{marginLeft:"10px", "padding":"0 0 10px 5px"}}>
      <Tooltip title="Open in Sysdig Secure">
        <IconButton aria-label='Open in new tab' size='small' target="_blank" href={backlink}>
          <OpenInNew fontSize="inherit" />
        </IconButton>
      </Tooltip>
      </div>
    </div>
  );
}

// convert url to an a href
const getUrl = (url: string) => {
  if (!url) {
    return null;
  }
  const hStyle = { color: 'blue' };
  return <a href={url} target="_blank" style={ hStyle }>Link to Scan Result</a>;
};

// column header with an explanatory tooltip
const getHeaderWithTooltip = (title: string, help: string) => (
  <Tooltip title={help}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {title}
      <InfoOutlined style={{ fontSize: 14 }} />
    </span>
  </Tooltip>
);

// URL encode a string
const urlEncode = (str: string) => {
  return encodeURIComponent(str);
};

export {
  getStatusColorSpan,
  getPolicyEvaluation,
  getLifecycle,
  getException,
  getChips,
  IN_USE_SEVERITIES,
  compareSeverities,
  getDetails,
  getDate,
  getUrl,
  getGauge,
  getScope,
  getFailed,
  getPassed,
  getResourceName,
  getTitleWithBacklink,
  getHeaderWithTooltip,
  urlEncode
};
