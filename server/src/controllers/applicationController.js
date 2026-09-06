import prisma from '../config/prisma.js';
import { evaluateApplication } from '../ai/matching.js';

/**
 * Application Controller
 * Owned by: Agent 2
 */
export const applicationController = {
  /**
   * GET /api/applications?facultyId=
   * List student applications, ordered by matchScore desc then createdAt desc
   */
  list: async (req, res, next) => {
    try {
      const { facultyId } = req.query;

      const where = {};
      if (facultyId) {
        where.facultyId = facultyId;
      }

      const applications = await prisma.application.findMany({
        where,
        orderBy: [
          // Order by matchScore descending (nulls will sort naturally or via subsequent sort)
          { matchScore: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          faculty: {
            select: {
              id: true,
              name: true,
              designation: true,
              researchInterests: true,
            },
          },
        },
      });

      res.json(applications);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/applications
   * Student submits a pitch.
   * Interface contract §2.2 & §2.3:
   * 1. Inserts Application row with status: PENDING, matchScore: null
   * 2. Asynchronously invokes evaluateApplication(applicationId) without blocking
   * 3. Returns HTTP 202 Accepted immediately
   */
  create: async (req, res, next) => {
    try {
      const { facultyId, studentName, studentEmail, studentContact, pitchText } = req.body;

      // Verify faculty exists
      const faculty = await prisma.faculty.findUnique({
        where: { id: facultyId },
      });

      if (!faculty) {
        return res.status(404).json({ error: `Faculty with ID '${facultyId}' not found` });
      }

      const application = await prisma.application.create({
        data: {
          facultyId,
          studentName: studentName.trim(),
          studentEmail: studentEmail.trim().toLowerCase(),
          studentContact: studentContact ? studentContact.trim() : null,
          pitchText: pitchText.trim(),
          status: 'PENDING',
          matchScore: null,
          matchSummary: null,
        },
      });

      // Contract §2.3: evaluateApplication called asynchronously
      evaluateApplication(application.id).catch((err) => {
        console.error(`[Application Evaluation Error for ${application.id}]:`, err);
      });

      // Contract §2.2: 202 Accepted returned immediately
      res.status(202).json({
        id: application.id,
        status: application.status,
        matchScore: application.matchScore,
        message: 'Application received. Scoring in progress.',
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/applications/:id
   * Faculty accepts or rejects an application
   */
  decide: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['ACCEPTED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: "Status must be either 'ACCEPTED' or 'REJECTED'" });
      }

      const existing = await prisma.application.findUnique({
        where: { id },
      });

      if (!existing) {
        return res.status(404).json({ error: `Application with ID '${id}' not found` });
      }

      const updated = await prisma.application.update({
        where: { id },
        data: { status },
        include: {
          faculty: {
            select: { id: true, name: true, researchInterests: true },
          },
        },
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/mentorships?facultyId=
   * Mentorship board: returns accepted applications grouped by research topic / faculty
   */
  mentorshipBoard: async (req, res, next) => {
    try {
      const { facultyId } = req.query;

      const where = { status: 'ACCEPTED' };
      if (facultyId) {
        where.facultyId = facultyId;
      }

      const acceptedApplications = await prisma.application.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          faculty: {
            select: {
              id: true,
              name: true,
              designation: true,
              email: true,
              researchInterests: true,
            },
          },
        },
      });

      // Group by topic (faculty's primary research interest, or fallback topic)
      const groupedMap = new Map();

      for (const app of acceptedApplications) {
        const primaryTopic =
          app.faculty.researchInterests && app.faculty.researchInterests.length > 0
            ? app.faculty.researchInterests[0]
            : 'General Academic Mentorship';

        if (!groupedMap.has(primaryTopic)) {
          groupedMap.set(primaryTopic, {
            topic: primaryTopic,
            faculty: {
              id: app.faculty.id,
              name: app.faculty.name,
              designation: app.faculty.designation,
              email: app.faculty.email,
              allInterests: app.faculty.researchInterests,
            },
            mentees: [],
            students: [],
          });
        }

        const studentRecord = {
          id: app.id,
          studentName: app.studentName,
          studentEmail: app.studentEmail,
          studentContact: app.studentContact,
          pitchText: app.pitchText,
          matchScore: app.matchScore,
          matchSummary: app.matchSummary,
          acceptedAt: app.createdAt,
        };

        groupedMap.get(primaryTopic).mentees.push(studentRecord);
        groupedMap.get(primaryTopic).students.push(studentRecord);
      }

      const result = Array.from(groupedMap.values());

      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
