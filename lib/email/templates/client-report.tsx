import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Img,
  Hr,
  Link,
} from "@react-email/components";

interface ClientReportProps {
  clientName: string;
  address: string;
  serviceType: string;
  equipment: string | null;
  technicianName: string;
  supervisorNotes: string | null;
  photos: { url: string; description: string }[];
  reportUrl: string | null;
}

export function ClientReport({
  clientName,
  address,
  serviceType,
  equipment,
  technicianName,
  supervisorNotes,
  photos,
  reportUrl,
}: ClientReportProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "40px", borderRadius: "8px", margin: "40px auto" }}>
          <Heading style={{ color: "#2563eb", fontSize: "24px" }}>
            ClimaTech — Reporte de Servicio
          </Heading>
          <Hr />
          <Section>
            <Text><strong>Cliente:</strong> {clientName}</Text>
            <Text><strong>Direccion:</strong> {address}</Text>
            <Text><strong>Tipo de servicio:</strong> {serviceType}</Text>
            {equipment && <Text><strong>Equipo:</strong> {equipment}</Text>}
            <Text><strong>Tecnico:</strong> {technicianName}</Text>
          </Section>

          {supervisorNotes && (
            <Section style={{ backgroundColor: "#f1f5f9", padding: "16px", borderRadius: "8px" }}>
              <Text style={{ fontWeight: "bold", fontSize: "14px" }}>Observaciones del supervisor</Text>
              <Text>{supervisorNotes}</Text>
            </Section>
          )}

          {photos.length > 0 && (
            <Section>
              <Heading as="h3" style={{ fontSize: "18px" }}>
                Evidencia Fotografica ({photos.length})
              </Heading>
              {photos.map((photo, i) => (
                <Section key={i} style={{ marginBottom: "16px" }}>
                  <Img src={photo.url} alt={photo.description} width="100%" style={{ borderRadius: "8px" }} />
                  <Text style={{ fontSize: "12px", color: "#64748b" }}>{photo.description}</Text>
                </Section>
              ))}
            </Section>
          )}

          {reportUrl && (
            <Section>
              <Text>
                Tambien puede ver este reporte en linea:{" "}
                <Link href={reportUrl}>Ver reporte</Link>
              </Text>
            </Section>
          )}

          <Hr />
          <Text style={{ fontSize: "12px", color: "#94a3b8" }}>
            Este reporte fue generado automaticamente por ClimaTech.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
