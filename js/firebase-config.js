// Firebase Configuration and Initialization
// This file uses Firebase compat libraries for vanilla JS compatibility

// Firebase configuration (safe to expose in frontend)
const firebaseConfig = {
    apiKey: "AIzaSyAvQYsvQlA6okg9frItXn8RrUz0HEq6g-c",
    authDomain: "forward-66ac4.firebaseapp.com",
    projectId: "forward-66ac4",
    storageBucket: "forward-66ac4.firebasestorage.app",
    messagingSenderId: "814531174586",
    appId: "1:814531174586:web:2cb24c774ff68c1bcbe283"
};

// Initialize Firebase (will be initialized after SDK loads)
let app, auth, db;

// Initialize Firebase when SDK is ready
function initializeFirebase() {
    if (typeof firebase !== 'undefined') {
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        console.log('%c Firebase Initialized! ', 'background: #4CAF50; color: white; padding: 4px;');
        return true;
    }
    return false;
}

// Auth State Observer
function onAuthStateChanged(callback) {
    if (auth) {
        auth.onAuthStateChanged(callback);
    }
}

// Get current user
function getCurrentUser() {
    return auth ? auth.currentUser : null;
}

// Sign up with email and password
async function signUpWithEmail(email, password, username, role) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Update display name
        await user.updateProfile({
            displayName: username
        });

        // Create user document in Firestore
        await createUserDocument(user, { username, role });

        return { success: true, user };
    } catch (error) {
        console.error('Signup error:', error);
        return { success: false, error: error.message, code: error.code };
    }
}

// Sign in with email and password
async function signInWithEmail(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message, code: error.code };
    }
}

// Sign in with Google
async function signInWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;

        // Check if user document exists, if not create it
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            await createUserDocument(user, {
                username: user.displayName || user.email.split('@')[0],
                role: 'founder' // Default role for social login
            });
        }

        return { success: true, user };
    } catch (error) {
        console.error('Google login error:', error);
        return { success: false, error: error.message, code: error.code };
    }
}

// Sign out
async function signOut() {
    try {
        await auth.signOut();
        return { success: true };
    } catch (error) {
        console.error('Signout error:', error);
        return { success: false, error: error.message };
    }
}

// Create user document in Firestore
async function createUserDocument(user, additionalData = {}) {
    const userRef = db.collection('users').doc(user.uid);

    const userData = {
        uid: user.uid,
        email: user.email,
        name: additionalData.username || user.displayName || '',
        role: additionalData.role || 'founder',
        onboardingCompleted: false,
        skills: [],
        location: null,
        geohash: null,
        rating: 0,
        completedGigsCount: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await userRef.set(userData, { merge: true });
    return userData;
}

// Get user document from Firestore
async function getUserDocument(uid) {
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
            return { success: true, data: userDoc.data() };
        }
        return { success: false, error: 'User not found' };
    } catch (error) {
        console.error('Get user error:', error);
        return { success: false, error: error.message };
    }
}

// Update user document
async function updateUserDocument(uid, data) {
    try {
        const userRef = db.collection('users').doc(uid);
        // Use set with merge: true to handle cases where the document might not exist (e.g., legacy users or botched signups)
        await userRef.set({
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        return { success: true };
    } catch (error) {
        console.error('Update user error:', error);
        return { success: false, error: error.message };
    }
}

// Mark onboarding as complete
async function setOnboardingComplete(uid) {
    return await updateUserDocument(uid, { onboardingCompleted: true });
}

// Create a new project for founder
async function createProject(uid, questionnaireAnswers) {
    try {
        const projectRef = db.collection('projects').doc();
        const projectData = {
            ownerId: uid,
            questionnaireAnswers: questionnaireAnswers,
            goal: {
                amount: null,
                timeline: null
            },
            status: 'questionnaire',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await projectRef.set(projectData);
        return { success: true, projectId: projectRef.id };
    } catch (error) {
        console.error('Create project error:', error);
        return { success: false, error: error.message };
    }
}

// Get user's projects
async function getUserProjects(uid) {
    try {
        const projectsSnapshot = await db.collection('projects')
            .where('ownerId', '==', uid)
            .orderBy('createdAt', 'desc')
            .get();

        const projects = [];
        projectsSnapshot.forEach(doc => {
            projects.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, projects };
    } catch (error) {
        console.error('Get projects error:', error);
        return { success: false, error: error.message };
    }
}

// Get project steps
async function getProjectSteps(projectId) {
    try {
        const stepsSnapshot = await db.collection('projects')
            .doc(projectId)
            .collection('steps')
            .orderBy('orderIndex', 'asc')
            .get();

        const steps = [];
        stepsSnapshot.forEach(doc => {
            steps.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, steps };
    } catch (error) {
        console.error('Get steps error:', error);
        return { success: false, error: error.message };
    }
}

// Update step status
async function updateStepStatus(projectId, stepId, status) {
    try {
        const stepRef = db.collection('projects')
            .doc(projectId)
            .collection('steps')
            .doc(stepId);

        const updateData = {
            status: status,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (status === 'done') {
            updateData.completedAt = firebase.firestore.FieldValue.serverTimestamp();
        }

        await stepRef.update(updateData);
        return { success: true };
    } catch (error) {
        console.error('Update step error:', error);
        return { success: false, error: error.message };
    }
}

// Listen to project steps (real-time)
function listenToProjectSteps(projectId, callback) {
    return db.collection('projects')
        .doc(projectId)
        .collection('steps')
        .orderBy('orderIndex', 'asc')
        .onSnapshot(snapshot => {
            const steps = [];
            snapshot.forEach(doc => {
                steps.push({ id: doc.id, ...doc.data() });
            });
            callback(steps);
        });
}

// Get all open gigs
async function getOpenGigs(filters = {}) {
    try {
        let query = db.collection('gigs').where('status', '==', 'open');

        if (filters.skills && filters.skills.length > 0) {
            query = query.where('requiredSkills', 'array-contains-any', filters.skills);
        }

        if (filters.locationMode) {
            query = query.where('locationMode', '==', filters.locationMode);
        }

        const gigsSnapshot = await query.orderBy('createdAt', 'desc').get();

        const gigs = [];
        gigsSnapshot.forEach(doc => {
            gigs.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, gigs };
    } catch (error) {
        console.error('Get gigs error:', error);
        return { success: false, error: error.message };
    }
}

// Listen to all open gigs (real-time)
function listenToOpenGigs(callback) {
    return db.collection('gigs')
        .where('status', '==', 'open')
        .onSnapshot(snapshot => {
            const gigs = [];
            snapshot.forEach(doc => {
                gigs.push({ id: doc.id, ...doc.data() });
            });
            callback(gigs);
        }, error => {
            console.error('Listen to open gigs error:', error);
        });
}

// Create a gig
async function createGig(gigData) {
    try {
        const gigRef = db.collection('gigs').doc();
        const gig = {
            ...gigData,
            status: 'open',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await gigRef.set(gig);
        return { success: true, gigId: gigRef.id };
    } catch (error) {
        console.error('Create gig error:', error);
        return { success: false, error: error.message };
    }
}

// Listen to gigs created by a specific owner
function listenToMyGigs(ownerId, callback) {
    return db.collection('gigs')
        .where('ownerId', '==', ownerId)
        .onSnapshot(snapshot => {
            const gigs = [];
            snapshot.forEach(doc => {
                gigs.push({ id: doc.id, ...doc.data() });
            });
            callback(gigs);
        }, error => {
            console.error('Listen to my gigs error:', error);
        });
}

// Get applicants for a specific gig
async function getGigApplicants(gigId) {
    try {
        const snapshot = await db.collection('gigs').doc(gigId).collection('applications').get();
        const applicants = [];
        for (const doc of snapshot.docs) {
            const app = doc.data();
            // Fetch name/skill from user doc for each applicant
            const userResult = await getUserDocument(app.collaboratorId);
            applicants.push({
                id: doc.id,
                ...app,
                profile: userResult.success ? userResult.data : null
            });
        }
        return { success: true, applicants };
    } catch (error) {
        console.error('Get applicants error:', error);
        return { success: false, error: error.message };
    }
}

// Apply to a gig
async function applyToGig(gigId, collaboratorId, message, proposedPrice) {
    try {
        const applicationRef = db.collection('gigs')
            .doc(gigId)
            .collection('applications')
            .doc();

        await applicationRef.set({
            collaboratorId,
            message,
            proposedPrice,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Also increment applicantCount on the gig document
        await db.collection('gigs').doc(gigId).update({
            applicantCount: firebase.firestore.FieldValue.increment(1)
        });

        // Add to user's appliedGigs array
        await db.collection('users').doc(collaboratorId).update({
            appliedGigs: firebase.firestore.FieldValue.arrayUnion(gigId)
        });

        return { success: true, applicationId: applicationRef.id };
    } catch (error) {
        console.error('Apply to gig error:', error);
        return { success: false, error: error.message };
    }
}

// Check onboarding status and return redirect path if needed
async function checkOnboardingStatus(user) {
    if (!user) return 'auth.html';

    try {
        const result = await getUserDocument(user.uid);

        // DEBUG LOGGING
        console.log('[AuthGuard] Checking status for:', user.email);
        console.log('[AuthGuard] Firestore Result:', result);

        if (!result.success) {
            console.warn('[AuthGuard] User document not found or error. Defaulting to onboarding.');
            return 'onboarding.html';
        }

        const userData = result.data;
        const role = userData.role || 'founder';
        const isComplete = userData.onboardingCompleted === true;

        // Get current filename, handle root/index
        const pathParts = window.location.pathname.split('/');
        let currentPage = pathParts.pop();
        if (currentPage === '' || currentPage === 'index.html') currentPage = 'index.html';

        console.log(`[AuthGuard] Role: ${role}, Complete: ${isComplete}, Page: ${currentPage}`);

        if (isComplete) {
            // User is DONE. Should be on Dashboard.
            const targetDashboard = role === 'collaborator' ? 'gigboard.html' : 'progress.html';

            console.log(`[AuthGuard] Target Dashboard: ${targetDashboard}`);

            // If on ANY onboarding page OR auth.html OR index.html (when logged in context) -> Redirect to Dashboard
            if (currentPage.includes('onboarding') || currentPage === 'auth.html' || currentPage === 'index.html') {
                console.log(`[AuthGuard] Redirecting to Dashboard from ${currentPage}`);
                return targetDashboard;
            }

            // If on WRONG dashboard -> Redirect to RIGHT dashboard
            if (role === 'collaborator' && currentPage === 'progress.html') return 'gigboard.html';
            if (role === 'founder' && currentPage === 'gigboard.html') return 'progress.html';

            // Explicitly return null if we are on the correct dashboard
            if (currentPage === targetDashboard) return null;

        } else {
            // User is NOT DONE. Should be on Onboarding.

            // If on Dashboard -> Go to Role-specific Onboarding
            if (currentPage === 'progress.html' || currentPage === 'gigboard.html') {
                const targetOnboarding = role === 'collaborator' ? 'onboarding-collaborator.html' : 'onboarding.html';
                console.log(`[AuthGuard] Incomplete. Redirecting from Dashboard to ${targetOnboarding}`);
                return targetOnboarding;
            }

            // If on auth or index -> Go to Role-specific Onboarding
            if (currentPage === 'auth.html' || currentPage === 'index.html') {
                const targetOnboarding = role === 'collaborator' ? 'onboarding-collaborator.html' : 'onboarding.html';
                return targetOnboarding;
            }

            // CRITICAL: If on *ANY* onboarding page, allow it.
            // This allows a "founder" to visit "onboarding-collaborator.html" to switch roles.
        }

        return null; // Correct place
    } catch (error) {
        console.error('Check onboarding error:', error);
        return null;
    }
}

// Check if user is authenticated for protected pages
function checkAuthAndRedirect() {
    onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = '../pages/auth.html';
        } else {
            const redirectPath = await checkOnboardingStatus(user);
            if (redirectPath) {
                window.location.href = redirectPath;
            }
        }
    });
}

// Check if user is unauthenticated for auth page (redirect if logged in)
function checkUnauthAndRedirect() {
    onAuthStateChanged(async (user) => {
        if (user) {
            const redirectPath = await checkOnboardingStatus(user);
            if (redirectPath) {
                window.location.href = redirectPath;
            } else {
                // If clean, default to dashboard based on role
                const result = await getUserDocument(user.uid);
                if (result.success) {
                    const role = result.data.role || 'founder';
                    window.location.href = role === 'collaborator' ? 'gigboard.html' : 'progress.html';
                }
            }
        }
    });
}

// Export for global access
window.ForwardFirebase = {
    initializeFirebase,
    onAuthStateChanged,
    getCurrentUser,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    createUserDocument,
    getUserDocument,
    updateUserDocument,
    setOnboardingComplete,
    checkOnboardingStatus,
    createProject,
    getUserProjects,
    getProjectSteps,
    updateStepStatus,
    listenToProjectSteps,
    getOpenGigs,
    listenToOpenGigs,
    createGig,
    listenToMyGigs,
    getGigApplicants,
    checkAuthAndRedirect,
    checkUnauthAndRedirect
};

console.log('%c Forward Firebase Module Loaded ', 'background: #3921A2; color: white; padding: 4px;');
