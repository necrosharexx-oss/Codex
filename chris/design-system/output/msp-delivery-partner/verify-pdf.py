from pathlib import Path
import json
import re
import unicodedata

from pypdf import PdfReader
import pypdfium2 as pdfium

root = Path(__file__).resolve().parent
file = root / "msp-delivery-partner.pdf"
reader = PdfReader(file)
assert len(reader.pages) == 2, "Expected exactly two pages"

texts = [unicodedata.normalize("NFKC", " ".join(page.extract_text().split())) for page in reader.pages]
compact_texts = [re.sub(r"\s+", "", text) for text in texts]
required = [
    [
        "Capture More AI Revenue Without Building a New Team",
        "Microsoft Copilot",
        "AI Agents",
        "Workflow & Process Automation",
        "Software Development",
        "Cloud Modernization",
        "Increase Delivery Capacity",
        "Improve Project Profitability",
        "Capture More AI Revenue",
        "Missed revenue opportunities",
        "More projects your team can pursue",
        "Scale Faster. Deliver Better. Grow Profitably.",
    ],
    [
        "Built Around Your Projects. Not Our Bench.",
        "Speed to Talent",
        "Purpose-Built Recruiting",
        "Commercial Flexibility",
        "Visibility and Retention",
        "<72",
        "<4%",
        "100%",
        "PMO",
        "XCHANGE EXCLUSIVE",
        "Complimentary MSP Delivery Capacity Assessment",
        "An active client project",
        "A technical delivery or staffing challenge",
        "An AI or automation initiative",
        "Recommended delivery approach",
        "Technical skills and resource requirements",
        "Project timeline considerations",
        "Nearshore engagement options",
        "No obligation. No commitment required.",
        "Juan Serrano",
        "Sales Manager",
        "juanserrano@michaelpage.com.co",
    ],
]
pages = []
font_names = set()
email_links = []
for index, page in enumerate(reader.pages):
    assert all(re.sub(r"\s+", "", phrase) in compact_texts[index] for phrase in required[index]), (
        index + 1,
        [phrase for phrase in required[index] if re.sub(r"\s+", "", phrase) not in compact_texts[index]],
    )
    assert float(page.mediabox.width) == 612
    assert float(page.mediabox.height) == 792
    assert "[Insert" not in texts[index]
    assert "Christian" not in texts[index]
    assert "\u2014" not in texts[index]
    assert ";" not in texts[index]
    fonts = page["/Resources"].get("/Font", {}).get_object()
    for font_ref in fonts.values():
        font = font_ref.get_object()
        descendants = font.get("/DescendantFonts")
        for descendant_ref in descendants or [font_ref]:
            descendant = descendant_ref.get_object()
            name = str(descendant.get("/BaseFont", ""))
            font_names.add(name)
            descriptor = descendant.get("/FontDescriptor")
            if "Aptos" in name:
                assert descriptor
                descriptor = descriptor.get_object()
                assert any(key in descriptor for key in ["/FontFile", "/FontFile2", "/FontFile3"])
    for annotation_ref in page.get("/Annots", []):
        annotation = annotation_ref.get_object()
        action = annotation.get("/A")
        if action:
            uri = str(action.get("/URI", ""))
            if uri.startswith("mailto:"):
                email_links.append(uri)
    pages.append({
        "page": index + 1,
        "width_points": float(page.mediabox.width),
        "height_points": float(page.mediabox.height),
        "required_content_verified": True,
    })
assert any("Aptos" in name for name in font_names)
assert "mailto:juanserrano@michaelpage.com.co" in email_links

document = pdfium.PdfDocument(str(file))
for index in range(len(document)):
    page = document[index]
    bitmap = page.render(scale=2)
    bitmap.to_pil().save(root / f"pdf-render-page-{index + 1}.png")
    bitmap.close()
    page.close()
document.close()
result = {
    "page_count": len(reader.pages),
    "pages": pages,
    "embedded_fonts": sorted(font_names),
    "contact_links": email_links,
    "pdf_bytes": file.stat().st_size,
    "rendered_for_visual_review": True,
}
(root / "pdf-verification.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
print(json.dumps(result, indent=2))

