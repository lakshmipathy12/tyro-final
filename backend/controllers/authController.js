const prisma = require('../utils/prismaClient');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Security: Don't reveal if user exists or not, but for dev we might be more explicit
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        // Ideally use bcrypt.compare, but if user hasn't registered via API yet, 
        // we might need a way to create initial users. 
        // Assuming passwords in DB are hashed.
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user.id, user.role);

        // Send cookie
        const cookieOptions = {
            expires: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
            ),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        };

        res.cookie('jwt', token, cookieOptions);

        // Send response
        user.password = undefined; // Don't send password back

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user,
            },
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.register = async (req, res) => {
    try {
        const {
            name, email, password, employeeId, role, department, designation,
            dob, sex, address, employeeType, joiningDate, shiftTime
        } = req.body;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { employeeId }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or Employee ID already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                employeeId,
                role: role || 'Employee',
                department,
                designation,
                dob: dob ? new Date(dob) : null,
                sex,
                address,
                employeeType,
                joiningDate: joiningDate ? new Date(joiningDate) : null,
                shiftTime,
                profileImage: req.body.profileImage || null
            },
        });

        res.status(201).json({
            status: 'success',
            data: {
                user: newUser,
            },
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, dob, sex, address, employeeType } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                dob: dob ? new Date(dob) : undefined,
                sex,
                address,
                employeeType,
                profileImage: req.body.profileImage
            }
        });

        updatedUser.password = undefined;

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: 'success' });
};
