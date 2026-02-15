import { Router } from "express";
import * as userController from '../controller/user.controller';
import { verifyRole, verifyToken } from "../utils/middlewares/auth.middleware";
import { UserRole } from "../types/auth.types";

const router = Router();

/**
 * @swagger
 * /api/v1/users/password:
 *   put:
 *     summary: Update a user's password
 *     description: |
 *       Updates the password for a user by verifying the old password first.
 *       Requires `email`, `oldPassword`, and `newPassword` in the request body.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePasswordRequest'
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/UserDTO'
 *       400:
 *         description: Bad Request - Missing required fields
 *       401:
 *         description: Unauthorized - Old password is incorrect
 *       404:
 *         description: Not Found - User not found
 *       500:
 *         description: Internal server error
 */
router.put('/password', userController.updatePassword);

/**
 * @swagger
 * /api/v1/users/{email}:
 *   delete:
 *     summary: Delete a user by email
 *     description: |
 *       Deletes a user by their email. Only accessible by users with the ADMIN role.
 *       
 *       🔐 **Authorization Required**
 *       - Bearer Token (JWT)
 *       - Role: ADMIN
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: [ADMIN]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email of the user to delete
 *         example: jane.doe@example.com
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *                 data:
 *                   $ref: '#/components/schemas/UserDTO'
 *       400:
 *         description: Bad Request - Missing email parameter
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       403:
 *         description: Forbidden - Requires ADMIN role
 *       404:
 *         description: Not Found - User not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:email', verifyToken, verifyRole(UserRole.ADMIN), userController.deleteUser);

/**
 * @swagger
 * /api/v1/users/{email}:
 *   patch:
 *     summary: Reactivate a user by email
 *     description: |
 *       Reactivates a previously deactivated user by their email. Only accessible by users with the ADMIN role.
 *       
 *       🔐 **Authorization Required**
 *       - Bearer Token (JWT)
 *       - Role: ADMIN
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: [ADMIN]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email of the user to reactivate
 *         example: john.doe@example.com
 *     responses:
 *       200:
 *         description: User reactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User reactivated successfully
 *                 data:
 *                   $ref: '#/components/schemas/UserDTO'
 *       400:
 *         description: Bad Request - Missing email parameter
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       403:
 *         description: Forbidden - Requires ADMIN role
 *       404:
 *         description: Not Found - User not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:email', verifyToken, verifyRole(UserRole.ADMIN), userController.reactivateUser);

export default router;