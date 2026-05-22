const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
        PageBreak, LevelFormat } = require('docx');
const fs = require('fs');
const path = require('path');

// Define table border style
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

const doc = new Document({
  styles: {
    default: { 
      document: { 
        run: { font: "Arial", size: 24 } 
      } 
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "2E75B6" },
        paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0 }
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "2E75B6" },
        paragraph: { spacing: { before: 280, after: 180 }, outlineLevel: 1 }
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "2E75B6" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 }
      }
    ]
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: 720, hanging: 360 }
              }
            }
          }
        ]
      },
      {
        reference: "numbers",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: 720, hanging: 360 }
              }
            }
          }
        ]
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: {
          width: 12240,
          height: 15840
        },
        margin: {
          top: 1440,
          right: 1440,
          bottom: 1440,
          left: 1440
        }
      }
    },
    children: [
      // Cover Page
      new Paragraph({
        spacing: { before: 2880 },
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "TECHNICAL PROPOSAL",
            size: 48,
            bold: true,
            color: "2E75B6"
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 480 },
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "Smart Snake Enclosure Monitoring System",
            size: 36,
            bold: true
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 240 },
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "Advanced Health, Digestion, and Fertility Monitoring",
            size: 28,
            italics: true
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 1440 },
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "Prepared for: Reptile Enclosure Manufacturing Company",
            size: 24
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 120 },
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            size: 24
          })
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // Executive Summary
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Executive Summary")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [
          new TextRun("This technical proposal outlines a comprehensive smart monitoring system for snake enclosures that leverages thermal imaging, computer vision, and IoT sensors to monitor critical health parameters including general health indicators, digestion processes, and reproductive fertility cycles.")
        ]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: "Key Innovation:",
            bold: true
          }),
          new TextRun(" This system transforms snake enclosures from passive housing into active healthcare monitoring platforms, enabling early disease detection, optimized breeding programs, and data-driven husbandry decisions.")
        ]
      }),

      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({
            text: "Primary Capabilities:",
            bold: true
          })
        ]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Real-time health monitoring with automated alert systems")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Digestion tracking using thermal imaging and weight sensors")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Fertility and reproductive cycle monitoring for breeding programs")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("AI-powered behavioral analysis for disease prediction")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Cloud-based analytics with veterinary integration")]
      }),

      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({
            text: "Target Markets:",
            bold: true
          })
        ]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Professional breeders seeking to optimize breeding success rates")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Zoological institutions requiring detailed health documentation")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Research facilities conducting herpetological studies")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Veterinary practices specializing in exotic animals")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Premium hobbyist market for high-value collections")]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // Table of Contents (manual for this proposal)
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Table of Contents")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("1. System Overview")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("2. Health Monitoring Parameters")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("3. Digestion Monitoring System")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("4. Fertility and Reproductive Monitoring")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("5. Hardware Architecture")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("6. Software and AI Analytics")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("7. Implementation Roadmap")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("8. Technical Specifications")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("9. Market Analysis and ROI")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("10. Competitive Advantages")]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // Section 1: System Overview
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("1. System Overview")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("1.1 Introduction")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [
          new TextRun("The Smart Snake Enclosure Monitoring System represents a paradigm shift in reptile husbandry by integrating multiple sensor modalities with artificial intelligence to provide comprehensive health monitoring. This system addresses critical gaps in current snake care by enabling continuous, non-invasive monitoring of physiological processes that were previously impossible to track without veterinary intervention.")
        ]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("1.2 Core Components")]
      }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 6560],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2800, type: WidthType.DXA },
                shading: { fill: "2E75B6", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Component",
                        bold: true,
                        color: "FFFFFF"
                      })
                    ]
                  })
                ]
              }),
              new TableCell({
                borders,
                width: { size: 6560, type: WidthType.DXA },
                shading: { fill: "2E75B6", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Description",
                        bold: true,
                        color: "FFFFFF"
                      })
                    ]
                  })
                ]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2800, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Thermal Camera")] })]
              }),
              new TableCell({
                borders,
                width: { size: 6560, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("High-resolution infrared imaging for temperature mapping, digestion tracking, and follicle detection (0.05°C accuracy, 640x480 resolution)")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2800, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("RGB Camera")] })]
              }),
              new TableCell({
                borders,
                width: { size: 6560, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("4K optical camera with computer vision for behavioral analysis, shed detection, and physical health assessment")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2800, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Weight Sensors")] })]
              }),
              new TableCell({
                borders,
                width: { size: 6560, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Integrated floor-scale system for continuous weight monitoring (±1g accuracy)")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2800, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Environmental Sensors")] })]
              }),
              new TableCell({
                borders,
                width: { size: 6560, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Multi-point temperature probes, humidity sensors, light intensity meters, and air quality monitors")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2800, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Edge Processing Unit")] })]
              }),
              new TableCell({
                borders,
                width: { size: 6560, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Local AI inference device for real-time analysis and alert generation (NVIDIA Jetson or equivalent)")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2800, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Cloud Platform")] })]
              }),
              new TableCell({
                borders,
                width: { size: 6560, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Secure data storage, analytics engine, and multi-enclosure management dashboard")] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // Section 2: Health Monitoring Parameters
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("2. Health Monitoring Parameters")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("2.1 Environmental Health Parameters")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [
          new TextRun("Proper environmental conditions are fundamental to snake health. The system continuously monitors and validates temperature gradients, humidity levels, and photoperiod compliance.")
        ]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Temperature Monitoring")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Basking spot: Species-specific targets (typically 85-95°F / 29-35°C)")] 
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Cool zone: 75-80°F (24-27°C) for most species")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Nighttime drop: Automated verification of 5-10°F temperature reduction")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Gradient mapping: Real-time thermal camera validation of proper temperature zones")]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Humidity Control")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Ambient humidity: Species-dependent (40-60% for arid, 60-80% for tropical)")] 
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Hide box humidity: Separate monitoring in humid retreats")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Shedding period adjustment: Automatic increase to 70-80% during pre-shed phase")]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("2.2 Physical Health Indicators")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Computer Vision Health Assessment")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun("The RGB camera system employs trained neural networks to detect visual health indicators:")
        ]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Body Condition Scoring: ",
          bold: true
        }), new TextRun("Automated assessment of spine prominence and body cross-section shape (rounded vs. triangular). Alerts trigger when body condition falls below species-appropriate thresholds.")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Shed Quality Monitoring: ",
          bold: true
        }), new TextRun("Detection of pre-shed dulling and cloudy eyes (blue phase), verification of complete vs. incomplete sheds, identification of retained eye caps or tail tips.")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Respiratory Distress Detection: ",
          bold: true
        }), new TextRun("Recognition of open-mouth breathing, head elevation during respiration, abnormal body positions, and visible nasal/oral discharge.")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Neurological Issue Identification: ",
          bold: true
        }), new TextRun("Automated detection of stargazing (abnormal upward head positioning), corkscrewing movements, loss of coordination, and head tremors indicating possible Inclusion Body Disease or other neurological conditions.")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Mouth Rot (Stomatitis) Screening: ",
          bold: true
        }), new TextRun("Color change detection around mouth area, swelling identification, presence of discharge or debris.")]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("2.3 Behavioral Analysis")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun("Behavioral changes often precede visible physical symptoms. The system establishes baseline activity patterns for each individual and alerts when deviations occur:")
        ]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Activity level quantification (movement distance, frequency, and duration)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Thermoregulation pattern analysis (time spent in different temperature zones)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Hide usage preferences and changes")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Feeding response analysis (strike behavior, acceptance/refusal patterns)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Defensive behavior tracking (changes in temperament or stress indicators)")]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // Section 3: Digestion Monitoring
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("3. Digestion Monitoring System")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("3.1 Thermogenic Digestion Tracking")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [
          new TextRun("Snakes experience specific induced thermogenesis (SIT) during digestion, with body temperature rising 2-7°F above ambient levels. This metabolic heat signature provides a non-invasive window into digestive health that was previously impossible to monitor continuously.")
        ]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Thermal Imaging Capabilities")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Post-Feeding Temperature Rise: ",
          bold: true
        }), new TextRun("System tracks body temperature elevation beginning 1-4 hours post-feeding. Normal thermogenesis indicates healthy metabolic function. Absence of temperature rise flags potential digestive issues requiring intervention.")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Digestion Location Tracking: ",
          bold: true
        }), new TextRun("The thermal camera visualizes the 'hot spot' created by the prey item as it moves through the digestive tract. Normal progression is several inches per day from stomach through intestines.")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Completion Verification: ",
          bold: true
        }), new TextRun("Temperature returns to baseline when digestion is complete (typically 2-5 days depending on meal size and species). System logs total digestion time for health records.")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Regurgitation Risk Detection: ",
          bold: true
        }), new TextRun("Excessive temperature spikes or abnormal patterns indicate stress or environmental issues that may lead to regurgitation. Early warnings allow corrective action.")]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("3.2 Weight-Based Digestion Analysis")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun("Continuous weight monitoring provides complementary data to thermal imaging:")
        ]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Immediate post-feeding weight confirms meal size consumed")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Gradual weight decrease during digestion tracks metabolic processing")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Post-defecation weight calculation determines net weight gain")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Digestion efficiency score: (Weight Gained / Prey Weight) × 100%")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Normal efficiency: 60-80% weight retention")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Alert threshold: <50% efficiency indicates health concerns")]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("3.3 Behavioral Correlation")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun("The system correlates thermal and weight data with behavioral patterns:")
        ]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Increased basking behavior (snakes seek warmth to aid digestion)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Activity reduction (should be mostly stationary for 24-48 hours)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Visible bulge progression tracking via RGB camera")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Abnormal movement patterns indicating discomfort or stress")]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("3.4 Automated Environmental Optimization")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun("The system automatically adjusts enclosure conditions to optimize digestion:")
        ]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Basking spot temperature increase of 2-3°F post-feeding")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Humidity maintenance to prevent regurgitation")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("'Do not disturb' mode reduces vibration and visual disturbances")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Alert suppression for non-critical notifications during digestion")]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // Section 4: Fertility Monitoring
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("4. Fertility and Reproductive Monitoring")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("4.1 Female Reproductive Cycle Tracking")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Follicle Development Detection")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [
          new TextRun("Thermal imaging can detect developing follicles 2-4 weeks before ovulation, providing unprecedented advance notice for breeding programs. Developing eggs create localized warmth in the lower third of the body, visible as distinct thermal patterns on the infrared camera.")
        ]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Pre-Ovulation Signatures: ",
          bold: true
        }), new TextRun("Follicle heat signatures appear in caudal region, mid-body warmth increases during folliculogenesis")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Ovulation Detection: ",
          bold: true
        }), new TextRun("Post-ovulatory swelling visible via thermal pattern changes, body temperature spike during ovulation event")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Behavioral Correlation: ",
          bold: true
        }), new TextRun("Increased basking, restlessness, and changes in feeding response correlated with thermal data")]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Gravid (Pregnant) Snake Monitoring")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun("Once gravid, the system provides comprehensive monitoring throughout egg development:")
        ]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Embryo Heat Mapping: ",
          bold: true
        }), new TextRun("Developing embryos create consistent warm zones along the body. Individual warm spots may enable clutch size estimation.")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Development Tracking: ",
          bold: true
        }), new TextRun("Temperature patterns change as embryos grow, providing insight into developmental progress.")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Pre-Lay Behavior Detection: ",
          bold: true
        }), new TextRun("Temperature seeking patterns shift 1-2 weeks before laying. RGB camera detects nesting behaviors like digging and exploration.")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Visual Confirmation: ",
          bold: true
        }), new TextRun("Body thickening, scale spreading, and pre-lay shed (2-4 weeks before oviposition) detected by computer vision.")]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("4.2 Male Reproductive Monitoring")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun("While less dramatic than female cycles, male reproductive condition can be monitored:")
        ]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Increased activity during breeding season with elevated baseline temperature")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Courtship behavior temperature elevation")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Scent-tracking behavior frequency increases (tongue-flicking analysis)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Feeding refusal patterns common during peak breeding season")]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("4.3 Weight-Based Fertility Indicators")]
      }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3120, 6240],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 3120, type: WidthType.DXA },
                shading: { fill: "2E75B6", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Parameter", bold: true, color: "FFFFFF" })] })]
              }),
              new TableCell({
                borders,
                width: { size: 6240, type: WidthType.DXA },
                shading: { fill: "2E75B6", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Monitoring Approach", bold: true, color: "FFFFFF" })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 3120, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Pre-breeding weight")] })]
              }),
              new TableCell({
                borders,
                width: { size: 6240, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Establish baseline; verify female has adequate body condition for successful reproduction")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 3120, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Follicle development")] })]
              }),
              new TableCell({
                borders,
                width: { size: 6240, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Gradual weight increase (5-20% depending on species and clutch size)")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 3120, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Gravid weight")] })]
              }),
              new TableCell({
                borders,
                width: { size: 6240, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Significant increase as eggs develop; enables clutch size estimation")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 3120, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Post-laying weight")] })]
              }),
              new TableCell({
                borders,
                width: { size: 6240, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Confirms successful oviposition; actual clutch size calculated from weight loss")] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("4.4 Breeding Cycle Prediction Algorithm")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun("Machine learning models integrate multiple data streams to predict optimal breeding windows:")
        ]
      }),

      new Paragraph({
        spacing: { before: 120, after: 80 },
        children: [new TextRun({ text: "Input Parameters:", bold: true })]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("6-month weight trend history")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Temperature preference patterns and thermoregulation behavior")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Activity level changes and movement patterns")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Feeding response patterns and appetite fluctuations")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Previous breeding history and cycle timing")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Seasonal photoperiod data and brumation patterns")]
      }),

      new Paragraph({
        spacing: { before: 240, after: 80 },
        children: [new TextRun({ text: "Predictive Outputs:", bold: true })]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Breeding readiness score (0-100% with confidence intervals)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Optimal pairing window with specific date ranges")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Expected ovulation date (±7 days accuracy)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Estimated laying date for gravid females")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Clutch size prediction based on weight gain trajectory")]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // Section 5: Hardware Architecture
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("5. Hardware Architecture")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("5.1 Sensor Specifications")]
      }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 2340, 2340, 2340],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "2E75B6", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Component", bold: true, color: "FFFFFF" })] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "2E75B6", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Specification", bold: true, color: "FFFFFF" })] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "2E75B6", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Accuracy", bold: true, color: "FFFFFF" })] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "2E75B6", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Sample Rate", bold: true, color: "FFFFFF" })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Thermal Camera")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("640×480 LWIR")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("±0.05°C")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("30 min intervals")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("RGB Camera")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("4K (3840×2160)")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("8MP sensor")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Continuous + triggers")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Weight Sensor")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Load cell array")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("±1g")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Continuous")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Temp Probes")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Digital (4-6 points)")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("±0.1°C")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("1 min intervals")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Humidity Sensors")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Digital (2-3 points)")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("±2% RH")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("5 min intervals")] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({
        spacing: { before: 360 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("5.2 System Integration Architecture")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun("The system employs a distributed architecture with edge processing for real-time analysis and cloud connectivity for long-term storage and advanced analytics.")
        ]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Edge Processing Unit")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Hardware: ",
          bold: true
        }), new TextRun("NVIDIA Jetson Xavier NX or equivalent (AI-capable SoC with 21 TOPS performance)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Function: ",
          bold: true
        }), new TextRun("Local inference for real-time health monitoring, immediate alert generation, video stream processing")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Storage: ",
          bold: true
        }), new TextRun("256GB NVMe SSD for local buffering and critical data retention")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Connectivity: ",
          bold: true
        }), new TextRun("WiFi 6, Ethernet, Bluetooth 5.0, optional cellular backup")]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Cloud Platform")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Infrastructure: ",
          bold: true
        }), new TextRun("AWS or Azure-based scalable architecture")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Database: ",
          bold: true
        }), new TextRun("Time-series database for sensor data, document store for images/video, relational database for structured records")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Analytics: ",
          bold: true
        }), new TextRun("Machine learning model training, historical trend analysis, predictive modeling")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Security: ",
          bold: true
        }), new TextRun("End-to-end encryption, HIPAA-compliant data handling, role-based access control")]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // Section 6: Software and AI Analytics
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("6. Software and AI Analytics")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("6.1 Machine Learning Models")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Computer Vision Models")]
      }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 3560, 3000],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2800, type: WidthType.DXA },
                shading: { fill: "2E75B6", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Model", bold: true, color: "FFFFFF" })] })]
              }),
              new TableCell({
                borders,
                width: { size: 3560, type: WidthType.DXA },
                shading: { fill: "2E75B6", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Purpose", bold: true, color: "FFFFFF" })] })]
              }),
              new TableCell({
                borders,
                width: { size: 3000, type: WidthType.DXA },
                shading: { fill: "2E75B6", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Architecture", bold: true, color: "FFFFFF" })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2800, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Shed Cycle Detector")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3560, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Identify pre-shed phase, track completion, detect retained shed")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3000, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("ResNet-50 classifier")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2800, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Stargazing Classifier")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3560, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Detect abnormal head positioning (IBD indicator)")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3000, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Pose estimation + angle threshold")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2800, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Body Condition Scorer")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3560, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Assess spine visibility and body cross-section")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3000, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Segmentation + geometric analysis")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2800, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Respiratory Distress")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3560, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Identify open-mouth breathing, head elevation")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3000, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Multi-frame LSTM classifier")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2800, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Activity Quantifier")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3560, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Track movement patterns and behavioral changes")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3000, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Object tracking + motion analysis")] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({
        spacing: { before: 360 },
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Thermal Analysis Models")]
      }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 3560, 3000],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2800, type: WidthType.DXA },
                shading: { fill: "2E75B6", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Model", bold: true, color: "FFFFFF" })] })]
              }),
              new TableCell({
                borders,
                width: { size: 3560, type: WidthType.DXA },
                shading: { fill: "2E75B6", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Purpose", bold: true, color: "FFFFFF" })] })]
              }),
              new TableCell({
                borders,
                width: { size: 3000, type: WidthType.DXA },
                shading: { fill: "2E75B6", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Output", bold: true, color: "FFFFFF" })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2800, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Digestion Tracker")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3560, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Monitor thermogenesis and prey movement")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3000, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Progress %, completion ETA")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2800, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Regurgitation Risk")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3560, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Predict regurgitation from thermal anomalies")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3000, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Risk score (low/med/high)")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2800, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Follicle Detector")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3560, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Identify developing eggs pre-ovulation")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3000, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Detection + ovulation ETA")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2800, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Gravid Identifier")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3560, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Confirm pregnancy and track embryo development")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3000, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Gravid Y/N, clutch estimate")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2800, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Clutch Size Estimator")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3560, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Count individual egg heat signatures")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3000, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Egg count (±2 eggs)")] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({
        spacing: { before: 360 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("6.2 User Interface and Dashboards")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Mobile Application")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Live camera feeds (thermal and RGB) with scrubbing capability")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Real-time health status dashboard with color-coded alerts")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Digestion tracking visualization with progress indicators")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Reproductive cycle calendar with breeding window notifications")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Historical trend graphs (weight, temperature preferences, activity)")] 
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Feeding and maintenance reminders")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Multi-enclosure management for facilities")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Veterinary collaboration tools (share video clips, export reports)")]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Web Dashboard")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Comprehensive analytics for breeding programs")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Multi-animal comparative analysis")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Customizable alert rules and thresholds")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Data export in CSV, PDF, and veterinary-standard formats")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Integration with inventory management systems")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Team collaboration features with role-based permissions")]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // Section 7: Implementation Roadmap
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("7. Implementation Roadmap")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("7.1 Development Phases")]
      }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1560, 2340, 2460, 3000],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 1560, type: WidthType.DXA },
                shading: { fill: "2E75B6", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Phase", bold: true, color: "FFFFFF" })] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "2E75B6", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Timeline", bold: true, color: "FFFFFF" })] })]
              }),
              new TableCell({
                borders,
                width: { size: 2460, type: WidthType.DXA },
                shading: { fill: "2E75B6", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Deliverables", bold: true, color: "FFFFFF" })] })]
              }),
              new TableCell({
                borders,
                width: { size: 3000, type: WidthType.DXA },
                shading: { fill: "2E75B6", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Key Activities", bold: true, color: "FFFFFF" })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 1560, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Phase 1: Prototype", bold: true })] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Months 1-4")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2460, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Functional prototype with core monitoring")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3000, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Hardware selection, sensor integration, basic thermal/RGB capture")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 1560, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Phase 2: AI Development", bold: true })] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Months 3-8")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2460, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Trained ML models for health detection")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3000, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Data collection, model training, validation with veterinarians")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 1560, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Phase 3: Software Platform", bold: true })] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Months 6-10")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2460, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Cloud platform, mobile app, web dashboard")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3000, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("UI/UX design, backend development, API integration")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 1560, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Phase 4: Beta Testing", bold: true })] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Months 9-12")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2460, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Field-tested system with user feedback")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3000, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Deploy to 10-20 test sites, iterate based on feedback")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 1560, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Phase 5: Production", bold: true })] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Month 12+")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2460, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Market-ready product")] })]
              }),
              new TableCell({
                borders,
                width: { size: 3000, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Manufacturing scale-up, sales launch, customer support")] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // Section 8: Technical Specifications
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("8. Technical Specifications")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("8.1 Physical Integration")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Mounting: ",
          bold: true
        }), new TextRun("Top-mount sensor pod with adjustable angle and height")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Dimensions: ",
          bold: true
        }), new TextRun("180mm × 120mm × 80mm (W × D × H) for standard enclosure sizes")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Weight Sensor: ",
          bold: true
        }), new TextRun("Integrated into enclosure floor, calibrated for individual animal weight range")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Power: ",
          bold: true
        }), new TextRun("12V DC, 25W typical, 40W peak (edge processing). Optional battery backup (4-hour runtime)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Environmental Rating: ",
          bold: true
        }), new TextRun("IP54 (dust and splash resistant) for electronics enclosure")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Operating Range: ",
          bold: true
        }), new TextRun("10-40°C ambient, 20-95% RH non-condensing")]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("8.2 Connectivity and Data")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Data Upload: ",
          bold: true
        }), new TextRun("Continuous stream to cloud (encrypted); local buffer during connectivity loss")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Bandwidth: ",
          bold: true
        }), new TextRun("1-5 Mbps typical (compressed video and sensor data)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Data Retention: ",
          bold: true
        }), new TextRun("72 hours local (critical events), unlimited cloud storage")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Latency: ",
          bold: true
        }), new TextRun("<500ms for critical alerts; 2-5 seconds for video streaming")]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("8.3 Compliance and Certifications")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("FCC Part 15 (EMI/EMC compliance)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("CE Mark (European conformity)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("UL/ETL Listed (electrical safety)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("RoHS compliant (hazardous substance restriction)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("GDPR compliant data handling (EU)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("HIPAA-aligned for veterinary data integration (US)")]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // Section 9: Market Analysis and ROI
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("9. Market Analysis and ROI")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("9.1 Target Market Segments")]
      }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 2340, 2340, 2340],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "2E75B6", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Segment", bold: true, color: "FFFFFF" })] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "2E75B6", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Market Size", bold: true, color: "FFFFFF" })] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "2E75B6", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Price Point", bold: true, color: "FFFFFF" })] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "2E75B6", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Key Value Proposition", bold: true, color: "FFFFFF" })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Professional Breeders")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("~5,000 operations (US/EU)")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("$800-1,200/unit")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("20-30% breeding success increase")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Zoos & Institutions")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("~800 facilities (global)")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("$1,500-2,500/unit")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Research data, regulatory compliance")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Research Facilities")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("~500 labs (global)")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("$2,000-3,500/unit")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Physiological research, automated data collection")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Exotic Veterinarians")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("~3,000 practices (US/EU)")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("$1,200-2,000/unit")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Diagnostic tool, telemedicine support")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Premium Hobbyists")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("~50,000 collectors (US/EU)")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("$600-900/unit")] })]
              }),
              new TableCell({
                borders,
                width: { size: 2340, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun("Peace of mind, optimal care for high-value animals")] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({
        spacing: { before: 360 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("9.2 Return on Investment Analysis")]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Professional Breeder ROI Example")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun("Consider a mid-size breeding operation with 50 female ball pythons producing an average of 6 eggs per clutch:")
        ]
      }),

      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Baseline Production: ",
          bold: true
        }), new TextRun("50 females × 6 eggs × 60% breeding success = 180 offspring/year")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "With Smart Monitoring: ",
          bold: true
        }), new TextRun("50 females × 6 eggs × 80% success = 240 offspring/year (+60 snakes)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Revenue Impact: ",
          bold: true
        }), new TextRun("60 additional snakes × $300 average = $18,000 additional revenue")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "System Cost: ",
          bold: true
        }), new TextRun("50 enclosures × $900/unit = $45,000 investment")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Payback Period: ",
          bold: true
        }), new TextRun("2.5 years")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "5-Year Net Benefit: ",
          bold: true
        }), new TextRun("$90,000 - $45,000 = $45,000 (100% ROI)")]
      }),

      new Paragraph({
        spacing: { before: 360, after: 120 },
        children: [
          new TextRun({
            text: "Additional Benefits Not Quantified:",
            bold: true
          })
        ]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Reduced veterinary costs through early disease detection")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Lower mortality rates from prevented health issues")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Time savings from automated monitoring vs. manual checks")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Premium pricing enabled by documented health records")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Reduced feeding waste through optimized schedules")]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // Section 10: Competitive Advantages
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("10. Competitive Advantages")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("10.1 Market Differentiation")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [
          new TextRun("The proposed system addresses an unmet need in the reptile husbandry market. Current enclosures are passive containers; this system transforms them into active health monitoring platforms.")
        ]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Unique Capabilities")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "First-to-Market: ",
          bold: true
        }), new TextRun("No existing reptile enclosure offers integrated thermal imaging and AI health monitoring")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Digestion Tracking: ",
          bold: true
        }), new TextRun("Unprecedented non-invasive monitoring of digestive health that was previously impossible")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Fertility Prediction: ",
          bold: true
        }), new TextRun("2-4 week advance notice of breeding readiness enables precise pairing timing")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Multi-Parameter Integration: ",
          bold: true
        }), new TextRun("Combines thermal, visual, weight, and environmental data for holistic health assessment")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Veterinary-Grade Data: ",
          bold: true
        }), new TextRun("Exportable records suitable for professional medical documentation")]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("10.2 Barriers to Entry")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun("This technology creates substantial barriers for competitors:")
        ]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "AI Training Data: ",
          bold: true
        }), new TextRun("Years of thermal and visual data required to train accurate models; first-mover advantage")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Veterinary Partnerships: ",
          bold: true
        }), new TextRun("Validation and endorsement from herpetological veterinarians builds credibility")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Patent Portfolio: ",
          bold: true
        }), new TextRun("Novel applications of thermal imaging for reptile health monitoring are patentable")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Network Effects: ",
          bold: true
        }), new TextRun("Multi-user platform becomes more valuable as more breeders join (comparative data, breeding marketplace)")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Integration Complexity: ",
          bold: true
        }), new TextRun("Hardware, software, and AI expertise required across multiple domains")]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("10.3 Strategic Positioning")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun("This system positions the company as:")
        ]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Technology Leader: ",
          bold: true
        }), new TextRun("First AI-powered health monitoring in reptile industry")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Premium Brand: ",
          bold: true
        }), new TextRun("Professional-grade equipment commands higher margins and customer loyalty")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Platform Provider: ",
          bold: true
        }), new TextRun("Recurring revenue from cloud services and software subscriptions")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Industry Partner: ",
          bold: true
        }), new TextRun("Collaboration with veterinarians, researchers, and conservation programs builds reputation")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "Data Aggregator: ",
          bold: true
        }), new TextRun("Unique dataset on reptile physiology valuable for research and product development")]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // Conclusion
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Conclusion")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [
          new TextRun("The Smart Snake Enclosure Monitoring System represents a transformative innovation in reptile husbandry. By integrating thermal imaging, computer vision, IoT sensors, and artificial intelligence, this system enables continuous, non-invasive monitoring of critical health parameters that were previously impossible to track without veterinary intervention.")
        ]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [
          new TextRun("The unique capabilities for digestion tracking and fertility monitoring address fundamental challenges in snake care and breeding programs. Professional breeders can expect 20-30% improvements in breeding success rates, while veterinarians gain unprecedented diagnostic data. Zoos and research facilities benefit from automated documentation and standardized health metrics.")
        ]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [
          new TextRun("The technology creates substantial competitive moats through AI training data, veterinary partnerships, and network effects. With a clear path to market leadership and strong ROI for target customers, this system positions your company at the forefront of the smart pet technology revolution.")
        ]
      }),

      new Paragraph({
        spacing: { before: 360, after: 120 },
        children: [
          new TextRun({
            text: "Recommended Next Steps:",
            bold: true,
            size: 28
          })
        ]
      }),
      new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Prototype development with 2-3 test enclosures")]
      }),
      new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Partnership discussions with leading herpetological veterinarians")]
      }),
      new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Initial data collection for AI model training")]
      }),
      new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Patent application filing for novel monitoring methods")]
      }),
      new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Beta testing program with 10-20 professional breeders")]
      }),

      new Paragraph({
        spacing: { before: 480 },
        children: [
          new TextRun({
            text: "This proposal demonstrates the technical feasibility and market opportunity for smart snake enclosure monitoring. We welcome the opportunity to discuss implementation details, partnership opportunities, and next steps.",
            italics: true
          })
        ]
      })
    ]
  }]
});

const outDir = path.join(__dirname, "..", "docs");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "Smart_Snake_Enclosure_Technical_Proposal.docx");

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outPath, buffer);
  console.log("Document created:", outPath);
}).catch((err) => { console.error(err); process.exit(1); });
