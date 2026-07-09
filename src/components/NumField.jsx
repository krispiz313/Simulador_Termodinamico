
import Latex from "./Latex";
import { S } from "../styles";

export default function NumField({ field, value, onChange, error, disabled }) {
  return (
    <div style={{ position: "relative" }}>
      <label style={S.fieldLabel}>
        <Latex tex={field.labelTex} />
        <span style={S.fieldUnit}>{field.unit}</span>
      </label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(field.key, e.target.value)}
        placeholder="0.00"
        style={{
          ...S.input,
          borderColor: error ? "#E0524A" : "#2A3D36",
          opacity: disabled ? 0.4 : 1,
        }}
      />
      {error && <div style={S.fieldError}>{error}</div>}
    </div>
  );
}
