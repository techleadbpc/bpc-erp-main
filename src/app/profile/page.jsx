import { useSelector } from "react-redux";
import { useState } from "react";
import {
  User,
  Mail,
  Shield,
  Building2,
  MapPin,
  Edit3,
  Camera,
  Settings,
  Activity,
  Calendar,
  Phone,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Mock role mapping - replace with your actual role data
const roleMapping = {
  1: {
    name: "Administrator",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  2: {
    name: "Mechanical Head",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  3: {
    name: "Mechanical Manager",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  4: { name: "Site Incharge", color: "bg-gray-100 text-gray-800 " },
  5: { name: "Store Manager", color: "bg-gray-100 text-gray-800 " },
  6: { name: "Project Manager", color: "bg-gray-100 text-gray-800 " },
};

const statusMapping = {
  idle: {
    name: "Active",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: Activity,
  },
  loading: {
    name: "Updating",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Activity,
  },
  error: {
    name: "Error",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: Activity,
  },
};

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">No user data available</p>
        </div>
      </div>
    );
  }

  const role = roleMapping[user.roleId] || {
    name: "Unknown Role",
    color: "bg-gray-100 text-gray-800 ",
  };

  const status = statusMapping[user.status] || statusMapping.idle;

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Profile</h1>
              <p className="text-muted-foreground mt-1">
                Manage your account information and preferences
              </p>
            </div>
            {/* <Button
              variant={isEditing ? "outline" : "default"}
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2"
            >
              {isEditing ? (
                <>
                  <Settings className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </>
              )}
            </Button> */}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Details Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editedUser.name}
                        onChange={(e) =>
                          setEditedUser({ ...editedUser, name: e.target.value })
                        }
                        className=" focus:border-primary"
                      />
                    ) : (
                      <div className="p-3 rounded-lg border">
                        <p className="font-medium">{user.name}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedUser.email}
                        onChange={(e) =>
                          setEditedUser({
                            ...editedUser,
                            email: e.target.value,
                          })
                        }
                        className=" focus:border-primary"
                      />
                    ) : (
                      <div className="p-3  rounded-lg border flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <p className="font-medium">{user.email}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        placeholder="Add phone number"
                        className=" focus:border-primary"
                      />
                    ) : (
                      <div className="p-3  rounded-lg border flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <p className="text-muted-foreground">Not provided</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">User ID</Label>
                    <div className="p-3  rounded-lg border">
                      <p className="font-mono text-sm">#00{user.id}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      placeholder="Tell us about yourself..."
                      className=" focus:border-primary min-h-[100px]"
                    />
                  ) : (
                    <div className="p-3  rounded-lg border min-h-[100px] flex items-center">
                      <p className="text-muted-foreground">No bio added yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Work Information */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Building2 className="h-5 w-5 text-green-600" />
                  Work Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Department</Label>
                    {isEditing ? (
                      <Input
                        placeholder="Enter department"
                        className=" focus:border-primary"
                      />
                    ) : (
                      <div className="p-3  rounded-lg border flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <p className="text-muted-foreground">
                          {user.department || "Not assigned"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Site Location</Label>
                    {isEditing ? (
                      <Input
                        placeholder="Enter site location"
                        className=" focus:border-primary"
                      />
                    ) : (
                      <div className="p-3  rounded-lg border flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <p className="text-muted-foreground">
                          {user?.site?.name || "Not assigned"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Role</Label>
                    <div className="p-3  rounded-lg border flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <Badge variant="outline" className={role.color}>
                        {role.name}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="p-3  rounded-lg border flex items-center gap-2">
                      <Activity className="h-4 w-4 text-gray-500" />
                      <Badge variant="outline" className={status.color}>
                        <status.icon className="h-3 w-3 mr-1" />
                        {status.name}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Save Changes
                </Button>
              </div>
            )}
          </div>

          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="relative inline-block mb-6">
                  <Avatar className="h-32 w-32 rounded-lg border-2">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="rounded-lg text-3xl">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-2 right-2 rounded-full shadow-lg border-2 border-white"
                  >
                    <Camera className="h-4 w-4" />
                  </Button> */}
                </div>

                <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
                <p className="text-muted-foreground mb-4">{user.email}</p>

                <div className="space-y-3">
                  <Badge
                    variant="outline"
                    className={`${role.color} px-3 py-1`}
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {role.name}
                  </Badge>

                  <div className="flex items-center justify-center">
                    <Badge
                      variant="outline"
                      className={`${status.color} px-3 py-1`}
                    >
                      <status.icon className="h-3 w-3 mr-1" />
                      {status.name}
                    </Badge>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Member since 2024</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span>Last active today</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Settings className="h-5 w-5 text-indigo-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-16 flex flex-col cursor-not-allowed gap-2 bg-transparent"
              >
                <Shield className="h-5 w-5" />
                <span className="text-sm">Change Password</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex flex-col gap-2 cursor-not-allowed bg-transparent"
              >
                <Globe className="h-5 w-5" />
                <span className="text-sm">Privacy Settings</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex flex-col gap-2 cursor-not-allowed bg-transparent"
              >
                <Activity className="h-5 w-5" />
                <span className="text-sm">Activity Log</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
